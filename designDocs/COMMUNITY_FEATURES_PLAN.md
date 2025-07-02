# Community Features System Design

## 💰 Cost Summary
**Total Estimated Cost: $12-18 across 4 phases**
- Phase 1: Garden Sharing & Discovery ($3-4)
- Phase 2: Community Interactions ($3-5)
- Phase 3: Knowledge Sharing Platform ($3-5)
- Phase 4: Advanced Community Tools ($3-4)

## 🔗 Dependencies
**CRITICAL DEPENDENCY**: Requires Authentication System ($10-14) to be implemented first.
- User accounts needed for profiles, garden ownership, and community interactions
- Cannot implement any community features without user identity management
- Authentication must be fully operational before starting Phase 1

## Overview & Goals

**Feature Purpose**: Create a community platform where gardeners can share their gardens, learn from others in similar zones, exchange knowledge, and collaborate on gardening challenges.

**User Value**: 
- Learn from experienced gardeners in similar climate zones
- Share successful garden designs and techniques
- Get advice and support from community members
- Discover new plants and growing methods through peer experience

**Current State**: No community features. Users garden in isolation without ability to connect with other gardeners or share experiences.

## Technical Architecture

### **Community Database Schema**

#### **User Profiles & Garden Sharing**
```sql
-- Extend existing SQLite database
CREATE TABLE user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(100) NOT NULL, -- Links to auth system user ID
    display_name VARCHAR(100),
    bio TEXT,
    gardening_experience VARCHAR(20), -- 'beginner', 'intermediate', 'advanced', 'expert'
    specialties TEXT, -- JSON array: organic, permaculture, containers, etc.
    hardiness_zone VARCHAR(10),
    general_location VARCHAR(100), -- City, State (no precise location)
    profile_image_url VARCHAR(500),
    public_profile BOOLEAN DEFAULT FALSE,
    joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shared_gardens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(100) NOT NULL,
    garden_id VARCHAR(100) NOT NULL, -- Links to user's garden
    title VARCHAR(200) NOT NULL,
    description TEXT,
    garden_type VARCHAR(50), -- 'vegetable', 'flower', 'herb', 'mixed', 'container'
    size_category VARCHAR(20), -- 'small', 'medium', 'large', 'commercial'
    hardiness_zone VARCHAR(10),
    growing_methods TEXT, -- JSON array: organic, hydroponic, raised_beds, etc.
    featured_plants TEXT, -- JSON array of plant IDs
    cover_image_url VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE,
    allow_comments BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE garden_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shared_garden_id INTEGER REFERENCES shared_gardens(id),
    photo_url VARCHAR(500),
    caption TEXT,
    photo_type VARCHAR(50), -- 'overview', 'plant_detail', 'harvest', 'problem', 'before_after'
    taken_date DATE,
    plant_id INTEGER, -- Optional reference to specific plant
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### **Community Interactions**
```sql
CREATE TABLE garden_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shared_garden_id INTEGER REFERENCES shared_gardens(id),
    user_id VARCHAR(100) NOT NULL,
    parent_comment_id INTEGER, -- For nested replies
    comment_text TEXT NOT NULL,
    helpful_count INTEGER DEFAULT 0,
    is_question BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE garden_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shared_garden_id INTEGER REFERENCES shared_gardens(id),
    user_id VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shared_garden_id, user_id)
);

CREATE TABLE garden_follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_user_id VARCHAR(100) NOT NULL,
    followed_user_id VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_user_id, followed_user_id)
);
```

#### **Knowledge Sharing**
```sql
CREATE TABLE community_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(100) NOT NULL,
    post_type VARCHAR(50), -- 'question', 'tip', 'problem', 'success_story', 'discussion'
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT, -- JSON array of tags
    hardiness_zone VARCHAR(10),
    plant_ids TEXT, -- JSON array of related plant IDs
    images TEXT, -- JSON array of image URLs
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    answer_count INTEGER DEFAULT 0,
    has_accepted_answer BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER REFERENCES community_posts(id),
    user_id VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    is_answer BOOLEAN DEFAULT FALSE,
    is_accepted_answer BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE community_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Community Service Layer**

#### **Garden Sharing Service**
```javascript
// New service: communityService.js
class CommunityService {
  async shareGarden(userId, gardenData, shareSettings) {
    // Create shareable garden with privacy controls
    const sharedGarden = await this.createSharedGarden({
      userId,
      gardenId: gardenData.id,
      title: shareSettings.title,
      description: shareSettings.description,
      isPublic: shareSettings.isPublic,
      allowComments: shareSettings.allowComments,
      featuredPlants: shareSettings.featuredPlants
    });
    
    // Generate cover image and thumbnails
    await this.generateGardenImages(sharedGarden.id, gardenData);
    
    return sharedGarden;
  }
  
  async discoverGardens(searchCriteria) {
    const filters = {
      hardinessZone: searchCriteria.zone,
      gardenType: searchCriteria.type,
      size: searchCriteria.size,
      growingMethods: searchCriteria.methods,
      featuredPlants: searchCriteria.plants
    };
    
    return this.querySharedGardens(filters, {
      sortBy: searchCriteria.sortBy || 'recent',
      limit: searchCriteria.limit || 20,
      offset: searchCriteria.offset || 0
    });
  }
  
  async getGardenRecommendations(userId) {
    const userProfile = await this.getUserProfile(userId);
    const userGardens = await this.getUserGardens(userId);
    
    return this.generatePersonalizedRecommendations(userProfile, userGardens);
  }
}
```

#### **Community Interaction Service**
```javascript
// Community interaction management
const communityInteractionService = {
  async addComment(gardenId, userId, commentData) {
    // Add comment with moderation check
    const comment = await this.createComment({
      sharedGardenId: gardenId,
      userId,
      commentText: commentData.text,
      parentCommentId: commentData.parentId,
      isQuestion: commentData.isQuestion
    });
    
    // Check for content moderation
    await this.moderateComment(comment);
    
    // Notify garden owner (if different user)
    await this.notifyGardenOwner(gardenId, userId, 'comment');
    
    return comment;
  },
  
  async likeGarden(gardenId, userId) {
    const existingLike = await this.findExistingLike(gardenId, userId);
    
    if (existingLike) {
      // Unlike
      await this.removeLike(existingLike.id);
      await this.updateLikeCount(gardenId, -1);
      return { action: 'unliked' };
    } else {
      // Like
      await this.addLike(gardenId, userId);
      await this.updateLikeCount(gardenId, +1);
      await this.notifyGardenOwner(gardenId, userId, 'like');
      return { action: 'liked' };
    }
  },
  
  async followUser(followerUserId, followedUserId) {
    const existingFollow = await this.findExistingFollow(followerUserId, followedUserId);
    
    if (existingFollow) {
      await this.removeFollow(existingFollow.id);
      return { action: 'unfollowed' };
    } else {
      await this.addFollow(followerUserId, followedUserId);
      await this.notifyUser(followedUserId, followerUserId, 'follow');
      return { action: 'followed' };
    }
  }
};
```

### **User Interface Components**

#### **CommunityDiscovery Component**
```javascript
// Garden discovery and browsing
const CommunityDiscovery = () => {
  const [filters, setFilters] = useState({
    zone: '',
    type: '',
    methods: [],
    plants: []
  });
  const [sortBy, setSortBy] = useState('recent');
  
  const { gardens, loading, hasMore } = useCommunityGardens(filters, sortBy);
  
  return (
    <div className="community-discovery">
      <DiscoveryFilters 
        filters={filters}
        onFiltersChange={setFilters}
        onSortChange={setSortBy}
      />
      <GardenGrid 
        gardens={gardens}
        loading={loading}
        onGardenClick={handleGardenView}
      />
      {hasMore && (
        <LoadMoreButton onClick={loadMore} />
      )}
    </div>
  );
};
```

#### **SharedGardenView Component**
```javascript
// Detailed view of shared garden
const SharedGardenView = ({ gardenId }) => {
  const { garden, owner, comments } = useSharedGarden(gardenId);
  const [showComments, setShowComments] = useState(true);
  
  return (
    <div className="shared-garden-view">
      <GardenHeader 
        garden={garden}
        owner={owner}
        onLike={handleLike}
        onFollow={handleFollow}
      />
      <GardenPhotoGallery 
        photos={garden.photos}
        coverImage={garden.coverImage}
      />
      <GardenDetails 
        description={garden.description}
        plants={garden.featuredPlants}
        methods={garden.growingMethods}
        zone={garden.hardinessZone}
      />
      <PlantShowcase 
        plants={garden.featuredPlants}
        onPlantClick={handlePlantDetail}
      />
      {showComments && (
        <CommentSection 
          comments={comments}
          onAddComment={handleAddComment}
          gardenId={gardenId}
        />
      )}
    </div>
  );
};
```

#### **CommunityKnowledgeBase Component**
```javascript
// Community Q&A and knowledge sharing
const CommunityKnowledgeBase = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [filters, setFilters] = useState({ zone: '', plants: [], tags: [] });
  
  return (
    <div className="community-knowledge-base">
      <KnowledgeBaseHeader 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreatePost={handleCreatePost}
      />
      <KnowledgeFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />
      <KnowledgeContent 
        type={activeTab}
        filters={filters}
        onPostClick={handlePostView}
      />
    </div>
  );
};
```

#### **UserProfile Component**
```javascript
// Public user profile and garden showcase
const UserProfile = ({ userId }) => {
  const { profile, gardens, activity } = useUserProfile(userId);
  const [activeSection, setActiveSection] = useState('gardens');
  
  return (
    <div className="user-profile">
      <ProfileHeader 
        profile={profile}
        onFollow={handleFollow}
        onMessage={handleMessage}
      />
      <ProfileNavigation 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <ProfileContent>
        {activeSection === 'gardens' && (
          <UserGardens 
            gardens={gardens}
            onGardenClick={handleGardenView}
          />
        )}
        {activeSection === 'activity' && (
          <UserActivity 
            activity={activity}
            onItemClick={handleActivityClick}
          />
        )}
        {activeSection === 'expertise' && (
          <UserExpertise 
            specialties={profile.specialties}
            experience={profile.experience}
            contributions={profile.contributions}
          />
        )}
      </ProfileContent>
    </div>
  );
};
```

## Security & Privacy

### **User Privacy Protection**
- **Location Privacy**: Only show general location (city/state), never precise coordinates
- **Profile Controls**: Users control all aspects of public profile visibility
- **Garden Sharing**: Explicit consent required for sharing garden data
- **Communication Controls**: Users can disable comments, messages, and follows

### **Content Moderation**
- **Automated Screening**: Basic content filtering for inappropriate text and images
- **Community Reporting**: User reporting system for inappropriate content
- **Expert Moderation**: Volunteer expert moderators for gardening advice quality
- **Content Guidelines**: Clear community guidelines and enforcement policies

### **Data Protection**
- **Shared Data Isolation**: Shared content separated from private garden data
- **Consent Management**: Clear consent for all community features and data sharing
- **Right to Delete**: Users can delete community contributions and shared gardens
- **Export Capabilities**: Users can export their community contributions

## Content Moderation Standards

### **Community Guidelines**
- **Respectful Communication**: Enforce respectful, helpful communication standards
- **Accurate Information**: Encourage evidence-based gardening advice and corrections
- **No Commercial Spam**: Prevent excessive self-promotion and commercial content
- **Privacy Respect**: Protect user privacy and prevent doxxing or harassment

### **Content Quality Standards**
- **Garden Sharing**: Require meaningful descriptions and accurate information
- **Advice Quality**: Promote helpful, actionable gardening advice
- **Photo Standards**: Appropriate garden-related photos with clear captions
- **Question Standards**: Encourage specific, answerable gardening questions

### **Moderation Tools**
- **User Reporting**: Easy reporting for inappropriate content or behavior
- **Automated Filtering**: Basic spam and inappropriate content detection
- **Expert Review**: Volunteer expert gardeners help moderate technical advice
- **Community Self-Policing**: Helpful/unhelpful voting by community members

## Implementation Phases

### **Phase 1: Garden Sharing & Discovery ($3-4)**
**Timeline**: 1-2 sessions
**Dependencies**: Database schema, image handling, basic UI components

**Deliverables**:
- Garden sharing functionality with privacy controls
- Garden discovery and browsing interface
- Basic user profiles for shared gardens
- Photo sharing and gallery features

**Technical Approach**:
- Implement community database schema
- Create garden sharing forms and interfaces
- Build discovery and search functionality
- Add photo upload and gallery components

### **Phase 2: Community Interactions ($3-5)**
**Timeline**: 1-2 sessions
**Dependencies**: Phase 1, notification system

**Deliverables**:
- Comment system for shared gardens
- Like/follow functionality
- User interaction notifications
- Basic community moderation tools

**Technical Approach**:
- Implement commenting and interaction systems
- Add notification system for community activities
- Create user following and social features
- Build basic content moderation tools

### **Phase 3: Knowledge Sharing Platform ($3-5)**
**Timeline**: 1-2 sessions
**Dependencies**: Phase 2, advanced content management

**Deliverables**:
- Community Q&A platform
- Knowledge base with tagging and search
- Expert recognition and reputation system
- Advanced content organization

**Technical Approach**:
- Build Q&A platform with voting and accepted answers
- Implement tagging and search for knowledge content
- Create reputation and expertise tracking
- Add advanced content organization and filtering

### **Phase 4: Advanced Community Tools ($3-4)**
**Timeline**: 1 session
**Dependencies**: Phase 3, analytics and recommendation systems

**Deliverables**:
- Personalized community recommendations
- Garden matching and collaboration tools
- Community analytics and insights
- Advanced moderation and management tools

**Technical Approach**:
- Implement recommendation algorithms for community content
- Add collaboration tools for garden projects
- Build community analytics and reporting
- Create advanced moderation and community management features

## Integration Points

### **Existing System Enhancement**
- **Authentication**: Extend with community profile management
- **Garden Data**: Enable selective sharing of private garden data
- **Plant Database**: Connect community discussions to plant information
- **Photo System**: Integrate with community photo sharing (if photo feature exists)

### **Component Integration**
- **Navigation**: Add community section to main navigation
- **User Dashboard**: Include community activity and recommendations
- **Plant Recommendations**: Show community experiences with recommended plants
- **Garden Planning**: Integration with shared garden inspiration and templates

### **Data Flow Integration**
```
User Garden → Sharing Decision → Community Garden → Discovery → User Inspiration
     ↓              ↓                  ↓            ↓           ↓
Private Data → Filtered Sharing → Public Community → Learning → Improved Gardens
```

## Risk Mitigation

### **Community Management Risks**
- **Content Quality**: Establish clear guidelines and moderation from launch
- **User Safety**: Strong privacy controls and reporting mechanisms
- **Expert Authority**: Clear guidelines about medical/safety advice limitations
- **Community Growth**: Plan for sustainable community growth and management

### **Technical Risks**
- **Scalability**: Design for growth in users and content volume
- **Performance**: Efficient queries and caching for community content
- **Storage**: Optimize image storage and delivery for shared content
- **Moderation Scale**: Automated tools to handle community growth

### **User Experience Risks**
- **Privacy Concerns**: Clear controls and education about sharing implications
- **Information Overload**: Well-organized content discovery and filtering
- **Quality Control**: Balance open community with quality content curation
- **Mobile Experience**: Ensure community features work well on mobile devices

## Success Metrics

### **Community Engagement Metrics**
- **Sharing Adoption**: >30% of users share at least one garden
- **Active Participation**: >50% of community users comment or like content
- **Knowledge Sharing**: >20% of users ask questions or provide advice
- **Return Engagement**: Regular community participants return weekly

### **Content Quality Metrics**
- **Helpful Content**: >80% of community posts rated as helpful
- **Expert Participation**: Active participation from experienced gardeners
- **Question Resolution**: >70% of gardening questions receive helpful answers
- **Content Diversity**: Broad range of garden types and growing methods represented

### **User Value Metrics**
- **Learning**: Users report learning new techniques from community
- **Inspiration**: Community gardens inspire new planting and design ideas
- **Problem Solving**: Users successfully solve gardening problems through community advice
- **Networking**: Users form ongoing relationships with other gardeners

## Cost Analysis

### **Implementation Costs**
- **Phase 1 (Garden Sharing)**: $3-4
- **Phase 2 (Community Interactions)**: $3-5
- **Phase 3 (Knowledge Sharing)**: $3-5
- **Phase 4 (Advanced Tools)**: $3-4
- **Total Implementation**: $12-18

### **Operational Costs**
- **Content Moderation**: Ongoing moderation and community management
- **Image Storage**: Increased storage costs for community photos
- **Performance**: Optimization for community content queries and delivery
- **Support**: Community guidelines enforcement and user support

### **Value Proposition**
- **User Retention**: Community features significantly increase user engagement and retention
- **Knowledge Creation**: User-generated content creates valuable gardening knowledge base
- **Network Effects**: Community growth creates compounding value for all users
- **Competitive Advantage**: Strong community differentiates from other garden planning tools

### **ROI Analysis**
- **Long-term Engagement**: Community features create sticky, long-term user relationships
- **Content Asset**: User-generated content becomes valuable platform asset
- **Expert Attraction**: Community attracts and retains expert gardeners as users
- **Growth Engine**: Community features enable organic user acquisition through sharing

**Recommendation**: Higher-cost feature that provides significant long-term value through community building and user-generated content. Community features create network effects that increase platform value for all users while establishing the app as the go-to destination for gardening knowledge and inspiration.
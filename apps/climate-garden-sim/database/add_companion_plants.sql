-- Companion Planting Relationships

-- Beneficial Companions
INSERT INTO companion_plants (plant_id, companion_plant_id, relationship_type, description) VALUES
-- Heat-tolerant crop companions
(1, 2, 'beneficial', 'Okra provides shade for pepper plants during extreme heat while peppers deter okra pests'),
(1, 3, 'beneficial', 'Amaranth and okra both thrive in heat and can be intercropped for space efficiency'),
(1, 8, 'beneficial', 'Plant lettuce at base of okra for natural shade during hot weather'),
(1, 13, 'beneficial', 'Rosemary planted nearby deters aphids and other soft-bodied insects from okra'),

(2, 13, 'beneficial', 'Rosemary repels aphids, spider mites, and other pepper pests while both enjoy full sun'),
(2, 14, 'beneficial', 'Thyme planted around peppers improves flavor and deters flea beetles'),
(2, 15, 'beneficial', 'Oregano companion planting enhances pepper flavor and attracts beneficial insects'),
(2, 6, 'beneficial', 'Fall-planted kale can be grown at base of pepper plants for cool-season succession'),

(3, 5, 'beneficial', 'Both amaranth and malabar spinach are heat-loving climbing plants that can share vertical space'),
(3, 10, 'beneficial', 'Amaranth provides light shade for carrots during hot weather while carrots use lower soil layer'),

(4, 16, 'beneficial', 'Mint planted around sweet potato beds deters rodents and ants'),

(5, 1, 'beneficial', 'Malabar spinach can climb okra stalks for efficient vertical growing'),
(5, 2, 'beneficial', 'Both plants enjoy heat and humidity, can be intercropped successfully'),

-- Cool-season crop companions  
(6, 8, 'beneficial', 'Kale and lettuce have similar growing requirements and can be succession planted together'),
(6, 9, 'beneficial', 'Spinach and kale make excellent cool-season companions with similar care needs'),
(6, 10, 'beneficial', 'Carrots and kale intercrop well - carrots use lower soil, kale provides light shade'),

(7, 10, 'beneficial', 'Classic pairing - carrots break up soil around cabbage roots and utilize different soil layers'),
(7, 8, 'beneficial', 'Lettuce can be planted between cabbage plants as a space-efficient intercrop'),
(7, 14, 'beneficial', 'Thyme planted around cabbage deters cabbage worms and other brassica pests'),
(7, 15, 'beneficial', 'Oregano helps repel cabbage moths and attracts beneficial predatory insects'),

(8, 11, 'beneficial', 'Lettuce and arugula have similar growing requirements and can extend salad harvest season'),
(8, 12, 'beneficial', 'Quick-growing radishes can be intercropped with slower lettuce for space efficiency'),
(8, 16, 'beneficial', 'Mint planted nearby can deter aphids and slugs that commonly affect lettuce'),

(9, 11, 'beneficial', 'Spinach and arugula make excellent cool-season salad companions'),
(9, 12, 'beneficial', 'Radishes mature quickly and can be harvested before spinach needs the space'),

(10, 11, 'beneficial', 'Arugula can be planted between carrot rows and harvested before carrots need full space'),
(10, 12, 'beneficial', 'Both root crops can be grown together with different maturity times'),

-- Herb companions
(13, 14, 'beneficial', 'Mediterranean herbs thrive together with similar sun and water requirements'),
(13, 17, 'beneficial', 'Rosemary and sage both prefer dry, well-drained conditions and full sun'),
(13, 18, 'beneficial', 'Lavender and rosemary make classic Mediterranean herb garden companions'),

(14, 15, 'beneficial', 'Thyme and oregano are culinary companions that grow well together'),
(14, 17, 'beneficial', 'Both herbs prefer dry conditions and can share space efficiently'),

(15, 17, 'beneficial', 'Oregano and sage complement each other in cooking and growing requirements');

-- Neutral relationships (can coexist but no particular benefit)
INSERT INTO companion_plants (plant_id, companion_plant_id, relationship_type, description) VALUES
(1, 4, 'neutral', 'Okra and sweet potatoes can coexist but compete for similar nutrients and space'),
(1, 5, 'neutral', 'Both plants tolerate heat well but may compete for vertical growing space'),
(2, 3, 'neutral', 'Peppers and amaranth can grow near each other without interference'),
(3, 4, 'neutral', 'Amaranth and sweet potatoes have different growth habits and do not interfere'),
(8, 9, 'neutral', 'Lettuce and spinach can coexist but do not provide mutual benefits'),
(16, 17, 'neutral', 'Mint and sage have different water requirements but can coexist in larger gardens');

-- Antagonistic relationships (avoid planting together)
INSERT INTO companion_plants (plant_id, companion_plant_id, relationship_type, description) VALUES
-- Heat vs Cool season conflicts
(1, 6, 'antagonistic', 'Okra heat requirements directly conflict with kale cool weather preferences'),
(1, 7, 'antagonistic', 'Okra needs hot weather while cabbage bolts and becomes bitter in heat'),
(1, 9, 'antagonistic', 'Spinach cannot tolerate the heat that okra requires for optimal growth'),

(2, 9, 'antagonistic', 'Hot peppers require heat that causes spinach to bolt immediately'),
(2, 8, 'antagonistic', 'Pepper heat requirements cause lettuce to bolt and become bitter'),

(3, 7, 'antagonistic', 'Amaranth thrives in heat that makes cabbage bolt and develop poor flavor'),
(3, 9, 'antagonistic', 'Heat-loving amaranth and cool-season spinach have opposite growing requirements'),

(4, 6, 'antagonistic', 'Sweet potatoes need warm soil that is too hot for optimal kale growth'),
(4, 8, 'antagonistic', 'Sweet potato heat requirements cause lettuce to bolt quickly'),

(5, 7, 'antagonistic', 'Malabar spinach loves heat and humidity that makes cabbage bolt and rot'),
(5, 9, 'antagonistic', 'Heat-loving malabar spinach and cool-season spinach cannot coexist'),

-- Herb-specific antagonisms
(16, 13, 'antagonistic', 'Mint requires consistent moisture while rosemary prefers dry conditions'),
(16, 18, 'antagonistic', 'Mint s water needs conflict with lavender s requirement for dry, well-drained soil'),

-- Root competition issues
(4, 10, 'antagonistic', 'Sweet potato vines spread widely and can overwhelm carrot growing space'),

-- Pest attraction conflicts
(6, 7, 'antagonistic', 'Growing brassicas together concentrates pest problems like cabbage worms and flea beetles'),
(7, 11, 'antagonistic', 'Both attract flea beetles; growing together increases pest pressure on both crops'),
(6, 11, 'antagonistic', 'Both brassicas attract same pests, creating concentrated target for pest infestations');
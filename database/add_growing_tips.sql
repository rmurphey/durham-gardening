-- Growing Tips and Regional Adaptations

-- Heat Management Tips for Hot Climates
INSERT INTO growing_tips (plant_id, region_id, tip_category, tip_text, priority) VALUES
(1, 1, 'climate_adaptation', 'In zones 8-9, provide afternoon shade during peak summer (July-August) to prevent pod toughening.', 1),
(1, 1, 'planting', 'Plant okra after soil temperature reaches 65°F consistently. Cold soil will stunt growth permanently.', 1),
(1, 1, 'care', 'Harvest pods daily when 3-4 inches long. Overmature pods become fibrous and stop plant production.', 1),

(2, 1, 'climate_adaptation', 'Hot peppers actually become more potent in extreme heat. Provide consistent moisture to prevent blossom end rot.', 1),
(2, 1, 'planting', 'Start indoors 8-10 weeks before last frost. Peppers are very sensitive to cold soil and air temperatures.', 1),
(2, 1, 'care', 'In zones 9-10, peppers can be grown as short-lived perennials with winter protection.', 2),

(3, 1, 'climate_adaptation', 'Amaranth thrives in heat waves that kill other greens. Can tolerate 100°F+ with adequate water.', 1),
(3, 1, 'planting', 'Direct seed after soil warms to 65°F. Succession plant every 2-3 weeks for continuous harvest.', 1),
(3, 1, 'harvest', 'Harvest young leaves for salads, mature leaves for cooking. Cut-and-come-again harvesting extends production.', 1),

(4, 1, 'climate_adaptation', 'Sweet potatoes love heat and humidity. Growth accelerates dramatically when temperatures exceed 80°F.', 1),
(4, 1, 'planting', 'Plant slips (rooted cuttings) 2-3 weeks after last frost when soil is warm. Cold, wet soil causes rot.', 1),
(4, 1, 'care', 'Harvest before first frost. Curing in 85°F, 90% humidity for 7-10 days improves storage life significantly.', 1),

(5, 1, 'climate_adaptation', 'Malabar spinach is ideal for Southern heat and humidity where regular spinach fails completely.', 1),
(5, 1, 'planting', 'Soak seeds 24 hours before planting. Germination is slow and uneven in cool conditions.', 1),
(5, 1, 'care', 'Provide vertical support for vining growth. Can climb 6-10 feet in optimal conditions.', 1);

-- Cool Season Optimization Tips
INSERT INTO growing_tips (plant_id, region_id, tip_category, tip_text, priority) VALUES
(6, 1, 'climate_adaptation', 'Kale becomes sweeter after light frosts. Can survive temperatures down to 10°F with protection.', 1),
(6, 1, 'planting', 'For summer harvest in hot climates, provide afternoon shade and extra water. Morning sun is sufficient.', 1),
(6, 1, 'care', 'Remove flower stalks immediately to keep leaves tender. Flowering makes leaves bitter and tough.', 1),

(7, 1, 'climate_adaptation', 'Cabbage heads may split in temperature fluctuations. Consistent moisture prevents splitting.', 1),
(7, 1, 'planting', 'Time planting so heads mature during cool weather. Hot weather causes bolting and bitter flavor.', 1),
(7, 1, 'pest_management', 'Row covers prevent cabbage worms and flea beetles. Remove covers when temperatures exceed 80°F.', 1),

(8, 1, 'climate_adaptation', 'Lettuce bolts rapidly in heat. In zones 8+, grow in partial shade during summer months.', 1),
(8, 1, 'planting', 'Succession plant every 2 weeks in cool seasons. Skip summer planting in zones 8+ unless using shade.', 1),
(8, 1, 'care', 'Harvest outer leaves continuously, or cut entire head 1 inch above soil for regrowth.', 1),

(9, 1, 'climate_adaptation', 'Spinach is extremely cold hardy but bolts quickly when day length exceeds 13 hours.', 1),
(9, 1, 'planting', 'Choose slow-bolt varieties for spring planting. Fall plantings generally produce better yields.', 1),
(9, 1, 'care', 'Harvest baby leaves at 2-3 inches for salads, mature leaves at 4-6 inches for cooking.', 1),

(10, 1, 'climate_adaptation', 'Carrots develop best flavor in cool weather. Hot soil makes roots bitter and tough.', 1),
(10, 1, 'planting', 'Direct seed only - carrots do not transplant well. Keep soil consistently moist until germination.', 1),
(10, 1, 'care', 'Thin seedlings to proper spacing. Crowded carrots will be small and misshapen.', 1);

-- Canadian-Specific Growing Tips
INSERT INTO growing_tips (plant_id, region_id, tip_category, tip_text, priority) VALUES
(2, 2, 'climate_adaptation', 'Start hot peppers indoors in late February for short Canadian growing season. Use season extenders.', 1),
(2, 2, 'planting', 'Choose short-season varieties (70-80 days) for reliable harvest before frost in most Canadian zones.', 1),
(2, 2, 'care', 'Use black plastic mulch to warm soil and extend growing season. Remove mulch if soil overheats.', 1),

(6, 2, 'climate_adaptation', 'Kale overwinters well in zones 6+ with snow cover providing insulation. Harvest through winter.', 1),
(6, 2, 'planting', 'Start fall crop in mid-July for harvest through winter. Spring crop can be direct seeded in April.', 1),

(7, 2, 'climate_adaptation', 'Cabbage stores well in root cellars. Late season varieties keep 3-4 months in proper storage.', 1),
(7, 2, 'planting', 'Plant early varieties in May, late storage varieties in June for fall harvest before hard frost.', 1),

(10, 2, 'climate_adaptation', 'Carrots can overwinter in zones 5+ under heavy mulch. Sweetness improves with cold exposure.', 1),
(10, 2, 'planting', 'Plant main crop in late May-early June. Short-season varieties allow succession planting.', 1),

(14, 2, 'climate_adaptation', 'Thyme survives Canadian winters in zones 4+ with good snow cover or winter protection.', 1),
(14, 2, 'care', 'Cut back by 1/3 in late fall. Mulch heavily in zones 4-5 for winter protection.', 1),

(15, 2, 'climate_adaptation', 'Oregano may die back in harsh winters but regrows from roots in spring in zones 4+.', 1),
(15, 2, 'care', 'Divide clumps every 3-4 years in spring. Take cuttings in late summer for indoor winter growing.', 1),

(16, 2, 'climate_adaptation', 'Mint is extremely hardy in Canada but can become invasive. Grow in containers to control spread.', 1),
(16, 2, 'care', 'Cut back severely in fall. Most mint varieties survive zone 3 winters with minimal protection.', 1);

-- Sun/Shade Tolerance Tips
INSERT INTO growing_tips (plant_id, tip_category, tip_text, priority) VALUES
(1, 'care', 'Okra requires full sun (6+ hours) for optimal pod production. Partial shade reduces yield significantly.', 1),
(2, 'care', 'Hot peppers need full sun for heat development and disease prevention. Poor air circulation invites fungal issues.', 1),
(3, 'care', 'Amaranth tolerates partial shade but colors are more vibrant in full sun. Shade extends harvest season in hot climates.', 2),
(4, 'care', 'Sweet potato vines spread widely and need full sun for tuber development. Shade reduces harvest size.', 1),
(5, 'care', 'Malabar spinach tolerates partial shade well, making it excellent for intercropping with taller plants.', 2),

(6, 'care', 'Kale tolerates partial shade and actually benefits from afternoon shade in hot climates (zones 8+).', 1),
(7, 'care', 'Cabbage needs full sun for proper head formation but appreciates protection from intense afternoon sun.', 1),
(8, 'care', 'Lettuce grows well in partial shade and requires it in hot climates to prevent bolting.', 1),
(9, 'care', 'Spinach tolerates partial shade and often performs better with morning sun/afternoon shade in warm areas.', 1),
(10, 'care', 'Carrots need full sun for proper root development but tops can tolerate light shade.', 1),
(11, 'care', 'Arugula appreciates partial shade in hot weather, which reduces bitterness and extends harvest.', 1),
(12, 'care', 'Radishes grow quickly in full sun but partial shade can slow growth and extend harvest window.', 2),

(13, 'care', 'Rosemary requires excellent drainage and full sun. Poor drainage is more harmful than cold temperatures.', 1),
(14, 'care', 'Thyme tolerates poor soil but needs full sun and good drainage. Wet feet causes root rot.', 1),
(15, 'care', 'Oregano grows in full sun to partial shade but flavor is most intense with full sun exposure.', 1),
(16, 'care', 'Mint is one of the few herbs that thrives in partial shade and moist conditions.', 1),
(17, 'care', 'Sage requires full sun and well-drained soil. Humid conditions can cause fungal problems.', 1),
(18, 'care', 'Lavender demands full sun and excellent drainage. Tolerates drought but not wet conditions.', 1);

-- Soil and Water Management Tips
INSERT INTO growing_tips (plant_id, tip_category, tip_text, priority) VALUES
(1, 'care', 'Okra tolerates poor soil but produces better with compost addition. Avoid high nitrogen which reduces flowering.', 2),
(2, 'care', 'Peppers prefer well-drained soil with pH 6.0-6.8. Consistent moisture prevents blossom end rot.', 1),
(3, 'care', 'Amaranth grows in poor soil but avoid over-fertilizing which causes excessive leaf growth at expense of seed production.', 2),
(4, 'care', 'Sweet potatoes prefer loose, well-drained soil. Heavy clay or rocky soil produces misshapen tubers.', 1),
(5, 'care', 'Malabar spinach likes rich, moist soil with good organic matter. Mulching helps retain soil moisture.', 1),

(6, 'care', 'Kale benefits from rich soil with plenty of nitrogen. Side-dress with compost monthly during growing season.', 1),
(7, 'care', 'Cabbage needs consistent moisture and rich soil. Uneven watering causes splitting and poor head formation.', 1),
(8, 'care', 'Lettuce has shallow roots and needs consistent surface moisture. Mulching helps maintain soil moisture.', 1),
(9, 'care', 'Spinach prefers cool, moist soil rich in nitrogen. Hot, dry soil causes premature bolting.', 1),
(10, 'care', 'Carrots need loose, stone-free soil to develop straight roots. Heavy clay causes forked, twisted carrots.', 1),

(13, 'care', 'Rosemary prefers alkaline soil (pH 7.0-8.0) and excellent drainage. More plants die from overwatering than drought.', 1),
(14, 'care', 'Thyme thrives in poor, rocky soil with good drainage. Rich soil reduces essential oil concentration.', 1),
(15, 'care', 'Oregano prefers neutral to slightly alkaline soil. Pinch flowers to maintain leaf production and flavor.', 1),
(16, 'care', 'Mint grows best in rich, moist soil and is one of the few herbs that tolerates wet conditions.', 1),
(17, 'care', 'Sage prefers well-drained, slightly alkaline soil. Avoid overhead watering which can cause leaf spot diseases.', 1),
(18, 'care', 'Lavender requires excellent drainage and slightly alkaline soil. Add gravel or sand to heavy soils.', 1);
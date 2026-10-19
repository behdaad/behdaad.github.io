"""Road-car family registry; model-index audit and exclusions are in README.md.

Rows: introduction year | displayed generation/body | model history page | image match | design notes | engineering notes.
Names, dates and factual notes are checked against the linked model histories.
"""
CATALOG={key:[] for key in ['ferrari','lamborghini','porsche','tesla','mercedes']}
def add(brand,id,name,category,story,rows,inherit=None):
    variants=[]
    for line in rows.strip().splitlines():
        fields=line.strip().split('|');fields+=['']*(6-len(fields))
        year,label,wiki,match,shape,engineering=fields
        variants.append(dict(year=int(year),name=label,wiki=wiki,match=match,shape=shape,engineering=engineering,kind='Production'))
    CATALOG[brand].append(dict(id=id,name=name,category=category,story=story,variants=variants,inherit=inherit))
# Ferrari: named road-car families, including Dino and homologation road cars.
add('ferrari','inter','166 / 195 / 212 Inter','Grand tourer','Ferrari’s first customer road-car lineage used small V12 engines and bodies from several coachbuilders. The Inter names distinguish these touring cars from similarly numbered competition cars.', '''
1948|166 Inter|Ferrari 166 Inter||Coachbuilt coupé and cabriolet bodies; proportions vary by coachbuilder.|A front-mounted Colombo V12 and rear-wheel drive.
1950|195 Inter|Ferrari 195 Inter||A development of the early coachbuilt touring format.|An enlarged Colombo V12.
1951|212 Inter|Ferrari 212 Inter||Longer touring bodies from Vignale, Ghia and Pinin Farina.|A further enlarged V12 in the early Inter lineage.
''')
add('ferrari','america','America / Superamerica / Superfast','Grand tourer','The large-engined America cars formed an exclusive coachbuilt grand-touring line. Different bodies and wheelbases make this family a record of the relationship between Ferrari and its coachbuilders.', '''
1950|340 America|Ferrari America|340|Long-bonnet coachbuilt bodies, including road-going touring examples.|A large Lampredi V12; competition examples are not separate entries here.
1952|342 America|Ferrari America|342|A more touring-oriented coachbuilt body.|A road-focused development of the large V12 formula.
1953|375 America|Ferrari America|375|A long-bonnet luxury coupé.|A larger Lampredi V12.
1955|410 Superamerica|Ferrari America|410|Substantial coachbuilt coupés with varied detailing.|An enlarged V12 at the top of the touring range.
1959|400 Superamerica|Ferrari America|400|Aerodynamic coupé and open-body interpretations.|A Colombo-derived V12 replaces the earlier Lampredi lineage.
1964|500 Superfast|Ferrari America|Superfast|A low, flowing Pininfarina coupé with a long rear deck.|A five-litre V12 and luxury grand-touring focus.
''')
add('ferrari','250','250 GT family','Grand tourer','The 250 badge covered several distinct road bodies rather than one unchanged car. The timeline separates the principal coachbuilt and series GT shapes; racing-only 250 models are outside this road-car catalog.', '''
1953|250 Europa|Ferrari 250|Europa|A large early touring body.|A Lampredi V12 in the first Europa.
1954|250 Europa GT|Ferrari 250|Europa|More compact GT proportions.|The Colombo V12 establishes the later 250 GT layout.
1956|250 GT Boano / Ellena|Ferrari 250|Boano|Low-roof Boano bodies evolve into higher-roof Ellena coupés.|The road-going 250 GT production line develops.
1956|250 GT Berlinetta Tour de France|Ferrari 250 GT Berlinetta|France|A long-wheelbase lightweight berlinetta.|A road-legal competition-oriented 250 GT.
1957|250 GT Cabriolet|Ferrari 250|Cabriolet|An open Pinin Farina touring body.|The front-V12 GT architecture with an open roof.
1957|250 GT California Spyder|Ferrari 250|California|A lower, more sporting open body, later offered on a shorter wheelbase.|A road-legal sporting derivative of the 250 GT.
1958|250 GT Coupé Pinin Farina|Ferrari 250|Pinin|A restrained three-box coupé body.|A more regular series-production 250 GT.
1959|250 GT Berlinetta SWB|Ferrari 250 GT Berlinetta|SWB|A shortened wheelbase and tightly rounded berlinetta body.|Road and competition versions share the basic shape.
1960|250 GTE 2+2|Ferrari 250|GTE|A longer cabin adds rear seats.|The first large-series four-seat Ferrari GT.
1962|250 GT Lusso|Ferrari 250 GT Lusso||A flowing fastback with a more luxurious cabin.|A road-focused 250 GT rather than a pure racing derivative.
''')
add('ferrari','250-gto','250 GTO','Homologation road car','A road-legal GT homologation model whose long nose and abruptly cut tail were shaped around racing requirements. It is included as a road-capable production homologation car, rather than as a race-only prototype.', '''
1962|250 GTO Series I|Ferrari 250 GTO|1962|A long sculpted nose, covered lamps and a cut-off tail.|A front-mounted V12 in a GT homologation chassis.
1964|250 GTO Series II|Ferrari 250 GTO|1964|A lower, more angular roof and revised tail.|A revised body on the GTO’s underlying front-V12 concept.
''')
add('ferrari','275','275 GTB / GTS','Sports grand tourer','The 275 family combined a closed berlinetta and an open two-seater. The later four-cam GTB/4 developed the mechanical package without replacing the basic berlinetta silhouette.', '''
1964|275 GTB|Ferrari 275|GTB|A long nose, compact cabin and short fastback tail.|A front V12, rear transaxle and independent rear suspension.
1964|275 GTS|Ferrari 275|GTS|An open two-seater with different, more upright bodywork.|The same broad front-V12 touring layout in an open body.
1966|275 GTB/4|Ferrari 275|GTB.4|A bonnet bulge distinguishes the four-cam berlinetta.|Four overhead camshafts develop the V12 architecture.
''')
add('ferrari','330','330','Grand tourer','The 330 road range spans a four-seat touring car and shorter two-seat GTC/GTS bodies. The small-run 330 America is retained as the transition from the 250’s four-seat body.', '''
1963|330 America|Ferrari 330|America|The four-seat 250 GTE body with a new engine.|A four-litre V12 in the preceding touring chassis.
1964|330 GT 2+2|Ferrari 330|2.2|An elongated four-seat coupé, initially with four headlamps.|A front V12 and a longer-wheelbase touring chassis.
1966|330 GTC|Ferrari 330 GTC||A two-seat coupé with slim pillars and a compact tail.|A shorter-wheelbase front-V12 GT.
1966|330 GTS|Ferrari 330 GTC|GTS|The GTC’s two-seat concept opened into a spider.|An open version of the shorter-wheelbase GT.
''')
add('ferrari','365','365 GT / California / GTC','Grand tourer','Before the Daytona, the 365 badge appeared on open and closed touring cars. These names share an engine-size designation but represent several bodies and seating arrangements.', '''
1966|365 California|Ferrari 365 California||A long open body with distinctive rear fins.|A front-mounted V12 in a limited touring series.
1967|365 GT 2+2|Ferrari 365 GT 2+2||A long four-seat coupé with a sweeping rear window.|A larger V12 and touring-oriented suspension.
1968|365 GTC / GTS|Ferrari 365 GTC|GTC|Compact two-seat coupé and spider bodies related to the 330 GTC/GTS.|An enlarged V12 in the shorter GT layout.
''')
add('ferrari','daytona','365 GTB/4 / GTS/4 Daytona','Sports grand tourer','The Daytona combines a front-mounted V12 with a sharp, low body. Coupé and spider versions share the long bonnet and wide stance; the open car changes the roofline rather than the basic layout.', '''
1968|365 GTB/4|Ferrari Daytona|GTB|A long, flat nose and sharply sloping fastback.|A front V12 with a rear-mounted transaxle.
1969|365 GTS/4|Ferrari Daytona|GTS|The fastback becomes an open spider with a flatter rear deck.|The front-V12 transaxle layout continues.
''')
add('ferrari','dino','Dino 206 / 246','Mid-engine sports car','Sold under the Dino name, this small mid-engined V6 family established a road-car layout that later became central to Ferrari. The GTS adds a removable roof panel.', '''
1967|206 GT|Dino 206 GT and 246 GT|206|A compact rounded berlinetta with flying rear buttresses.|A transverse mid-mounted V6 and an aluminium body.
1969|246 GT|Dino 206 GT and 246 GT|246|A longer body retains the rounded Dino outline.|A larger V6 and steel bodywork.
1972|246 GTS|Dino 206 GT and 246 GT|GTS|A removable roof panel opens the cabin.|The 246 running gear in a targa body.
''')
add('ferrari','365-gtc4','365 GTC/4','Grand tourer','The GTC/4 was a short-lived four-seat companion to the Daytona. Its softer fastback, folding rear seats and prominent dark nose treatment distinguish its touring brief.', '''
1971|365 GTC/4|Ferrari 365 GTC/4||A rounded fastback with a dark bumper surrounding the grille.|A front V12 and touring-focused four-seat packaging.
''')
add('ferrari','400','365 GT4 2+2 / 400 / 412','Grand tourer','A long-lived four-seat Ferrari line with crisp, largely horizontal bodywork. Changes in engine size and transmission were more extensive than changes to the basic shape.', '''
1972|365 GT4 2+2|Ferrari 365 GT4 2+2, 400 and 412|365|A long, angular two-door body with a tall glasshouse.|A front V12 and four-seat grand-touring layout.
1976|400 / 400i|Ferrari 365 GT4 2+2, 400 and 412|400|The same crisp body with restrained detail changes.|The line gains an automatic gearbox; injection later replaces carburettors.
1985|412|Ferrari 365 GT4 2+2, 400 and 412|412|A higher rear deck and revised lower body details.|The final enlarged-engine development of the family.
''')
add('ferrari','bb','Berlinetta Boxer','Mid-engine sports car','The Boxer moves Ferrari’s twelve-cylinder road car from a long-bonnet layout to a mid-engined wedge. The 365 and 512 versions share the low, broad body concept.', '''
1973|365 GT4 BB|Ferrari Berlinetta Boxer|365|A low wedge with pop-up lamps and a black lower body.|A mid-mounted flat-12 engine.
1976|512 BB / BBi|Ferrari Berlinetta Boxer|512|A wider stance and revised lower nose retain the wedge.|A larger flat-12; the later BBi adds fuel injection.
''')
add('ferrari','gt4','Dino / Ferrari 208 / 308 GT4','Mid-engine 2+2','Bertone’s angular GT4 body packages four seats around a mid-mounted V8. The Dino-to-Ferrari badge change and the smaller-engined 208 do not create separate body designs.', '''
1973|308 / 208 GT4|Ferrari GT4||A wedge-shaped four-seat body with a relatively upright cabin.|A transverse mid-mounted V8; the 208 is the smaller-engined derivative.
''')
add('ferrari','308','208 / 308 GTB / GTS','Mid-engine sports car','The 308’s Pininfarina body became a long-lived Ferrari visual template. GTB and removable-roof GTS bodies are shown separately; injection, turbo and valve-count changes remain within those shapes.', '''
1975|308 / 208 GTB|Ferrari 308 GTB/GTS|GTB|A low berlinetta with a scalloped intake behind each door.|A transverse mid-mounted V8; early GTBs use glassfibre bodywork.
1977|308 / 208 GTS|Ferrari 308 GTB/GTS|GTS|A removable roof panel and louvred rear-quarter treatment.|The same transverse-V8 architecture in an open-roof body.
''')
add('ferrari','mondial','Mondial','Mid-engine 2+2','The Mondial develops the four-seat mid-engined Ferrari into a longer-lived coupé and cabriolet line. The final Mondial t changes the powertrain arrangement while retaining the general body.', '''
1980|Mondial coupé|Ferrari Mondial|coupe|A tall-roofed 2+2 with side intake strakes.|A transverse mid-mounted V8.
1983|Mondial Cabriolet|Ferrari Mondial|Cabriolet|A folding fabric roof opens the four-seat cabin.|The same broad 2+2 chassis concept.
1989|Mondial t|Ferrari Mondial|Mondial.t|Revised intake shapes and lower body details.|A longitudinal engine with a transverse gearbox changes the drivetrain arrangement.
''')
add('ferrari','288-gto','288 GTO','Homologation road car','Based visually on the 308, the GTO gains wider arches, extra vents and a different mechanical layout. The road cars survive a cancelled racing category; the Evoluzione development car is excluded.', '''
1984|288 GTO|Ferrari 288 GTO||Wide wheelarches, deep side openings and three vents behind each rear wheel.|A longitudinal twin-turbo V8 in a homologation-oriented road chassis.
''')
add('ferrari','testarossa','Testarossa / 512 TR / F512 M','Mid-engine grand tourer','The Testarossa family makes radiator packaging visible through its side strakes and broad rear body. The 512 TR refines the nose; the F512 M replaces the pop-up lamps.', '''
1984|Testarossa|Ferrari Testarossa|Testarossa|Pop-up lamps, horizontal strakes and a full-width rear grille.|A mid-mounted flat-12 and side radiators.
1991|512 TR|Ferrari Testarossa|512.TR|A smoother nose, new wheels and revised lower body.|A reworked flat-12 and revised chassis.
1994|F512 M|Ferrari Testarossa|512.M|Fixed covered headlights and exposed circular rear lamps.|The final development of the manual flat-12 road car.
''',inherit='testarossa')
add('ferrari','328','328 / GTB Turbo / GTS Turbo','Mid-engine sports car','The 328 smooths and rounds the 308’s body language. Smaller-engined turbo models used a closely related body and are indexed within the same family.', '''
1985|328 GTB / GTB Turbo|Ferrari 328|GTB|A smoother, more integrated front bumper and rounded body edges.|An enlarged transverse V8; the GTB Turbo uses a smaller turbo engine.
1985|328 GTS / GTS Turbo|Ferrari 328|GTS|A removable roof panel within the revised 328 body.|The same broad running-gear layout in the open-roof version.
''')
add('ferrari','f40','F40','Flagship supercar','A lightweight twin-turbo flagship whose fixed wing, rear vents and visible engine make its mechanical purpose part of its appearance. Race-only LM and GTE developments are excluded.', '''
1987|F40 road car|Ferrari F40|F40|A fixed rear wing, louvred engine cover and perforated rear panel.|A twin-turbo V8 and lightweight composite bodywork.
''',inherit='f40')
add('ferrari','348','348','Mid-engine sports car','The 348 applies the Testarossa’s horizontal strakes to a smaller V8 car. Its coupé, removable-roof and spider forms share a new longitudinal engine arrangement.', '''
1989|348 TB / GTB|Ferrari 348|TB|Side strakes and a black full-width rear grille.|A longitudinal V8 with a transverse gearbox.
1989|348 TS / GTS|Ferrari 348|TS|A removable roof within the coupé-like outline.|The same mid-engined architecture with an open roof panel.
1993|348 Spider|Ferrari 348|Spider|A fully open roof and lower rear deck.|A reinforced open-body version of the 348.
''')
add('ferrari','456','456 / 456M','Grand tourer','A return to a more rounded front-V12 four-seater after the angular 400/412 line. The M revision updates the nose and cabin while keeping the basic proportions.', '''
1992|456 GT / GTA|Ferrari 456|456.GT|A flowing four-seat coupé with pop-up headlamps.|A front V12 and rear transaxle; manual and automatic versions.
1998|456M|Ferrari 456|456M|A revised grille, bonnet and cabin details.|The same front-V12 four-seat concept.
''')
add('ferrari','f355','F355','Mid-engine sports car','The F355 softens the 348’s surfaces and replaces side strakes with open intakes. Berlinetta, GTS and Spider bodies show the different roof treatments.', '''
1994|F355 Berlinetta|Ferrari F355|Berlinetta|Open side intakes and smoother V8 berlinetta bodywork.|A five-valve-per-cylinder V8.
1994|F355 GTS|Ferrari F355|GTS|A removable roof panel in the berlinetta outline.|The mid-V8 layout with an open-roof panel.
1995|F355 Spider|Ferrari F355|Spider|A folding fabric roof and flatter rear deck.|A reinforced open chassis; F1-shift versions later join the range.
''')
add('ferrari','f50','F50','Flagship supercar','The F50 combines a removable roof with a large integrated rear wing. Its naturally aspirated V12 and carbon structure take a different approach from the turbocharged F40.', '''
1995|F50|Ferrari F50||A rounded nose, removable roof and integrated rear wing.|A naturally aspirated V12 mounted within a carbon-composite structure.
''')
add('ferrari','550','550 / 575M Maranello','Grand tourer','The Maranello line returns the two-seat flagship GT to a front-engine layout. The Barchetta and Superamerica offer visibly different open-roof solutions.', '''
1996|550 / 575M Maranello|Ferrari 550 Maranello|Maranello|A long bonnet, short cabin and rounded rear haunches.|A front V12 and rear transaxle; the 575M develops the engine and transmission.
2000|550 Barchetta|Ferrari 550 Maranello|Barchetta|A low windscreen and open roof replace the coupé roof.|A limited-production open version of the 550.
2005|575 Superamerica|Ferrari 575M Maranello|Superamerica|A rotating glass roof changes from coupé to open body.|A retractable-roof development of the 575M.
''')
add('ferrari','360','360','Mid-engine sports car','The aluminium-bodied 360 uses rounded volumes and large glazed areas. The Spider opens the roof; the Challenge Stradale brings a more exposed road-legal track treatment.', '''
1999|360 Modena|Ferrari 360|Modena|Rounded body surfaces and a glass engine cover.|An aluminium structure and a mid-mounted V8.
2000|360 Spider|Ferrari 360|Spider|An open cabin with a folding fabric roof.|The same aluminium mid-engine architecture.
2003|Challenge Stradale|Ferrari 360|Stradale|A sharper nose, lower stance and more visible aerodynamic detail.|A lighter road-legal performance derivative.
''')
add('ferrari','enzo','Enzo','Flagship supercar','The Enzo’s pointed nose and exposed-looking aero surfaces bring Formula One references into a production road car. The FXX track programme is outside this catalog.', '''
2002|Enzo|Enzo Ferrari (automobile)||A pointed nose, high tail and butterfly doors.|A carbon structure with a naturally aspirated V12 and automated transmission.
''')
add('ferrari','612','612 Scaglietti','Grand tourer','A large four-seat V12 coupé with an aluminium structure. Its long wheelbase and scalloped sides prioritise touring space within a two-door body.', '''
2004|612 Scaglietti|Ferrari 612 Scaglietti||A long four-seat cabin and broad scalloped body sides.|An aluminium structure with a front V12 and rear transaxle.
''')
add('ferrari','f430','F430','Mid-engine sports car','The F430 develops the 360’s aluminium V8-car layout with more angular intakes and a new engine. Its Scuderia derivatives add more visible aero and a lighter specification.', '''
2004|F430 coupé|Ferrari F430|F430|Large oval front openings and high rear exhausts.|A new V8 and electronically controlled differential.
2005|F430 Spider|Ferrari F430|Spider|A folding fabric roof in the mid-V8 body.|An open version of the aluminium structure.
2007|430 Scuderia / 16M|Ferrari F430|Scuderia|More pronounced aero details and high-mounted exhaust outlets.|Lighter road-legal coupé and spider derivatives.
''')
add('ferrari','599','599 GTB / GTO / SA Aperta','Grand tourer','The 599 combines a front V12 with flying rear buttresses. GTO and SA Aperta versions explore a more track-oriented coupé and a limited open body.', '''
2006|599 GTB Fiorano|Ferrari 599|GTB|Flying rear buttresses bridge the cabin and rear wings.|An aluminium structure with a front V12 and rear transaxle.
2010|599 GTO|Ferrari 599|GTO|A more aggressive front opening, bonnet vents and rear aero.|A road-legal performance derivative; the 599XX is excluded.
2010|SA Aperta|Ferrari 599|Aperta|A low windscreen and open cabin replace the coupé roof.|A limited open-body development of the 599.
''')
add('ferrari','california','California / California T','Grand tourer','A front-engined V8 four-seater with a folding metal roof. The California T introduces turbocharging and a redesigned nose and sides.', '''
2008|California|Ferrari California|2008|A folding hardtop, tall tail and vertically stacked exhaust outlets.|A front-mounted V8 and dual-clutch transmission.
2014|California T|Ferrari California|California.T|A sharper front, cleaner flanks and horizontal exhaust layout.|A turbocharged V8 replaces the naturally aspirated engine.
''')
add('ferrari','458','458','Mid-engine sports car','The 458 changes Ferrari’s V8 berlinetta with narrow lamps and integrated aero details. The Speciale develops the visible airflow devices; the Spider removes the fixed roof.', '''
2009|458 Italia|Ferrari 458|Italia|Narrow rising headlights and three central rear exhausts.|A naturally aspirated mid-mounted V8 and dual-clutch gearbox.
2011|458 Spider|Ferrari 458|Spider|A retractable hardtop changes the roof and engine-cover arrangement.|The V8 platform in an open-roof body.
2013|458 Speciale / Speciale A|Ferrari 458|Speciale|Additional vents, revised bumpers and active aero details.|Lighter road-legal coupé and open-roof performance versions.
''')
add('ferrari','ff','FF','Shooting brake','The FF puts four seats and a large rear opening inside a V12 shooting-brake body. Its four-wheel-drive system changes the traditional front-V12 Ferrari touring layout.', '''
2011|FF|Ferrari FF||An extended roof, upright rear hatch and two-door shooting-brake body.|A front V12 and a compact front-drive assistance system.
''')
add('ferrari','f12','F12berlinetta / F12tdf','Grand tourer','A front-V12 two-seater shaped around deep channels and a short rear deck. The tdf derivative opens up the body with extra vents and more prominent aero surfaces.', '''
2012|F12berlinetta|Ferrari F12|Berlinetta|Deeply channelled flanks and an aero bridge beside the bonnet.|A front V12 and a rear transaxle.
2015|F12tdf|Ferrari F12|tdf|Additional louvres, a sharper nose and a more exposed aero treatment.|A lighter road car with rear-wheel steering.
''')
add('ferrari','laferrari','LaFerrari','Flagship supercar','Ferrari’s hybrid flagship combines a naturally aspirated V12 with electric assistance. The Aperta opens the central roof while keeping the main body language.', '''
2013|LaFerrari coupé|LaFerrari|LaFerrari|A narrow canopy and deeply cut side channels.|A carbon structure combining a V12 with HY-KERS electrical assistance.
2016|LaFerrari Aperta|LaFerrari|Aperta|An open roof within the coupé’s sculpted body.|A reinforced open-body version of the hybrid flagship.
''',inherit='laferrari')
add('ferrari','488','488','Mid-engine sports car','The 488 takes the V8 berlinetta into turbocharging. Its larger side openings and later Pista aero treatment make cooling and airflow more prominent.', '''
2015|488 GTB|Ferrari 488|GTB|Large split side intakes and a more open nose.|A turbocharged mid-mounted V8.
2015|488 Spider|Ferrari 488|Spider|A folding hardtop and revised rear deck.|The turbo-V8 architecture in an open body.
2018|488 Pista / Pista Spider|Ferrari 488|Pista|A large front S-duct and more pronounced aero additions.|Lighter road-legal coupé and spider performance versions.
''')
add('ferrari','gtc4lusso','GTC4Lusso','Shooting brake','The GTC4Lusso revises the FF’s four-seat shooting-brake formula. V12 and turbo-V8 versions share the body, with different driven-wheel arrangements.', '''
2016|GTC4Lusso / T|Ferrari GTC4Lusso||A longer-looking shooting-brake roof and four circular rear lamps.|V12 four-wheel-drive and turbo-V8 rear-wheel-drive specifications.
''')
add('ferrari','812','812 Superfast / GTS','Grand tourer','The 812 develops the front-V12 two-seater with a more angular body and rear-wheel steering. The GTS adds a folding roof, while Competizione models use substantially different aero details.', '''
2017|812 Superfast|Ferrari 812 Superfast|Superfast|A long bonnet, deeply cut sides and four rear lights.|A front V12 with rear-wheel steering.
2019|812 GTS|Ferrari 812 Superfast|GTS|A retractable roof with rear buttresses.|An open version of the front-V12 two-seater.
2021|812 Competizione / A|Ferrari 812 Superfast|Competizione|Bonnet blade, revised vents and a new rear-screen treatment.|Limited road-going coupé and open-roof performance derivatives.
''')
add('ferrari','portofino','Portofino','Grand tourer','A folding-hardtop front-V8 four-seater that succeeds the California. The M update is retained in the model index but grouped with the same body chapter.', '''
2017|Portofino / M|Ferrari Portofino||A folding hardtop, more compact-looking tail and sharply cut side openings.|A turbocharged front V8 and dual-clutch gearbox; M revises the drivetrain.
''')
add('ferrari','monza','Monza SP1 / SP2','Limited-production barchetta','The first Icona road cars remove the conventional windscreen and roof. One- and two-seat versions reinterpret the open competition bodies of earlier Ferraris.', '''
2018|Monza SP1|Ferrari Monza SP1|SP1|A single open cockpit under an asymmetric tonneau cover.|A front V12 and limited-production road-car structure.
2018|Monza SP2|Ferrari Monza SP1|SP2|Two open seats and paired head fairings.|The same V12 architecture with a second passenger position.
''')
add('ferrari','f8','F8 Tributo / Spider','Mid-engine sports car','The F8 continues the non-hybrid turbo-V8 berlinetta line with a new nose and a louvred engine cover. Coupé and Spider forms use different roof and rear-deck arrangements.', '''
2019|F8 Tributo|Ferrari F8|Tributo|An S-duct nose and a louvred transparent engine cover.|A turbocharged mid-mounted V8.
2019|F8 Spider|Ferrari F8|Spider|A retractable hardtop and revised engine cover.|The same turbo-V8 layout in an open body.
''')
add('ferrari','sf90','SF90 Stradale / Spider / XX','Plug-in hybrid sports car','The SF90 adds a plug-in hybrid system and front electric drive to a mid-engined V8. The road-legal XX adds a fixed wing and much more exposed aerodynamic hardware.', '''
2019|SF90 Stradale|Ferrari SF90 Stradale|Stradale|A low wedge, slim headlamps and square-shaped rear lights.|A plug-in hybrid V8 with electric front-axle drive.
2020|SF90 Spider|Ferrari SF90 Stradale|Spider|A retractable hardtop changes the cabin opening and rear deck.|The same plug-in hybrid architecture.
2023|SF90 XX Stradale / Spider|Ferrari SF90 Stradale|XX|A large fixed rear wing, vents and revised nose.|Road-legal XX versions, distinguished from Ferrari’s track-only XX programme.
''')
add('ferrari','roma','Roma / Roma Spider','Grand tourer','The Roma uses a smooth fastback body and a restrained nose for a front-V8 GT. The later Spider changes to a folding fabric roof.', '''
2019|Roma|Ferrari Roma|Roma|A clean fastback, slim lamps and a body-coloured grille treatment.|A turbocharged front V8 and rear-wheel drive.
2023|Roma Spider|Ferrari Roma|Spider|A fabric folding roof replaces the fastback roof.|An open front-V8 touring car.
''')
add('ferrari','296','296 GTB / GTS','Plug-in hybrid sports car','A compact mid-engined Ferrari built around a turbocharged V6 and electrical assistance. GTB, GTS and Speciale bodies distinguish closed, open and more aero-focused forms.', '''
2021|296 GTB|Ferrari 296|GTB|A short, rounded body with a low rear screen and flying buttresses.|A plug-in hybrid turbo V6.
2022|296 GTS|Ferrari 296|GTS|A folding hardtop within the compact V6 body.|The hybrid architecture in an open-roof body.
2025|296 Speciale / Speciale A|Ferrari 296|Speciale|Revised front openings, louvres and rear aero devices.|Lighter road-going performance developments of the hybrid family.
''')
add('ferrari','daytona-sp3','Daytona SP3','Limited-production sports car','The SP3’s mid-engined body draws on Ferrari’s sports-prototype history while remaining a production road car. Its horizontal rear blades and wraparound windscreen distinguish it from the front-engined Monza.', '''
2021|Daytona SP3|Ferrari Daytona SP3||Horizontal rear blades, butterfly doors and a wraparound windscreen.|A mid-mounted naturally aspirated V12 and carbon structure.
''')
add('ferrari','purosangue','Purosangue','Four-door grand tourer','Ferrari’s first series-production four-door combines a raised body with a naturally aspirated V12. Rear-hinged back doors and a low roof aim to retain a sporting profile.', '''
2022|Purosangue|Ferrari Purosangue||Four doors, rear-hinged back doors and a raised fastback-like body.|A front V12, four-wheel drive and active suspension.
''')
add('ferrari','12cilindri','12Cilindri','Grand tourer','The 12Cilindri pairs a long-bonnet V12 layout with a strong horizontal nose graphic. Coupé and Spider bodies continue the two-seat front-engined touring line.', '''
2024|12Cilindri coupé|Ferrari 12Cilindri|Coupe|A dark horizontal nose band and contrasting rear glass/body panels.|A naturally aspirated front V12 and rear-wheel steering.
2024|12Cilindri Spider|Ferrari 12Cilindri|Spider|A folding roof and revised rear buttresses.|An open-body version of the V12 GT.
''')
add('ferrari','f80','F80','Flagship supercar','The F80 changes Ferrari’s limited-production flagship from a V12 hybrid to a turbocharged V6 hybrid. A narrow cabin and prominent aero surfaces give it a different outline from LaFerrari.', '''
2024|F80|Ferrari F80||A narrow cabin, dark nose band and large active rear wing.|A carbon structure and a V6 hybrid powertrain with electric front drive.
''')
add('ferrari','amalfi','Amalfi','Grand tourer','The Amalfi develops the front-V8 touring line after the Roma. It retains a compact two-door format while revising the nose and cabin controls.', '''
2025|Amalfi|Ferrari Amalfi||A broad dark nose graphic and a smooth fastback body.|A front-mounted turbo V8 and rear-wheel drive.
2026|Amalfi Spider|Ferrari Amalfi|Spider|A fabric folding roof opens the touring body.|An open version of the front-V8 GT.
''')
add('ferrari','849-testarossa','849 Testarossa','Plug-in hybrid sports car','A new mid-engined hybrid family uses the Testarossa name without continuing the 1980s flat-12 chassis. Its split-tail treatment and broad nose belong to a separate production design.', '''
2025|849 Testarossa|Ferrari 849 Testarossa||A dark nose band and twin rear winglets around a short central tail.|A turbocharged V8 plug-in hybrid with electric front drive.
2025|849 Testarossa Spider|Ferrari 849 Testarossa|Spider|A folding hardtop within the new hybrid body.|The same hybrid architecture in an open version.
''')
add('ferrari','luce','Luce','Electric car','Ferrari’s first battery-electric road-car family introduces a different packaging and cabin programme. Its place here follows the production-model introduction, rather than earlier disguised development cars.', '''
2026|Luce|Ferrari Luce||A dedicated electric-car body and a physically detailed cabin-control design.|A battery-electric Ferrari platform.
''')
# Lamborghini: regular series and road-legal few-offs; track-only Sesto/Essenza excluded.
add('lamborghini','350gt','350 GT','Grand tourer','Lamborghini’s first series-production car was a front-engined V12 grand tourer. Touring’s rounded aluminium body differs from the earlier GTV prototype.', '''
1964|350 GT|Lamborghini 350 GT||A rounded coupé with oval lamps and a compact cabin.|A front V12 and independent suspension.
''')
add('lamborghini','400gt','400 GT','Grand tourer','The 400 GT enlarges the first Lamborghini GT’s engine and, in 2+2 form, adds a taller cabin and rear seats. Coachbuilt one-offs are outside this family catalog.', '''
1966|400 GT / Interim|Lamborghini 400 GT|400|A rounded two-seat body close to the 350 GT.|An enlarged front-mounted V12.
1966|400 GT 2+2|Lamborghini 400 GT|2.2|A higher roof and revised rear window accommodate rear seats.|A four-seat development of the front-V12 GT.
''')
add('lamborghini','miura','Miura','Mid-engine sports car','The Miura packages a transverse V12 behind the cabin under Gandini’s low, flowing body. The SV develops its rear stance and removes the original headlamp eyelashes.', '''
1966|P400 / S|Lamborghini Miura|P400|A low rounded nose, rising doors and headlamp eyelashes.|A transverse mid-mounted V12; the S develops the specification.
1971|P400 SV|Lamborghini Miura|SV|Wider rear haunches and plainer headlamp surrounds.|A revised rear chassis and more developed V12 installation.
''',inherit='miura')
add('lamborghini','islero','Islero','Grand tourer','A restrained four-seat V12 coupé developed from Lamborghini’s first front-engined GTs. The S is grouped with the same body design.', '''
1968|Islero / S|Lamborghini Islero||A relatively upright coupé with a conventional boot and slim pillars.|A front-mounted V12 and four-seat touring layout.
''')
add('lamborghini','espada','Espada','Four-seat grand tourer','A very low four-seat body with a long glasshouse and a large rear hatch. Three series revise the cabin and details while retaining the same unusually broad proportions.', '''
1968|Series I|Lamborghini Espada|Series.I|A low roof, long glasshouse and glass-backed tail.|A front V12 and a full four-seat cabin.
1970|Series II / III|Lamborghini Espada|Series.II|Revised dashboards and exterior details retain the long hatchback body.|The touring drivetrain develops; an automatic option joins later.
''')
add('lamborghini','jarama','Jarama','Grand tourer','The Jarama replaces the Islero with a shorter, more angular 2+2 body. Its distinctive partially covered headlamps contrast with Lamborghini’s mid-engined sports cars.', '''
1970|Jarama GT / GTS|Lamborghini Jarama||An angular 2+2 coupé with partially covered headlamps.|A front V12; the GTS develops the same touring layout.
''')
add('lamborghini','urraco','Urraco','Mid-engine 2+2','The Urraco brings a transverse V8 and four-seat packaging to a smaller Lamborghini. Engine-size derivatives share the wedge-shaped body.', '''
1972|P200 / P250 / P300|Lamborghini Urraco||A compact wedge with a long louvred rear deck.|A transverse mid-mounted V8 and 2+2 seating.
''')
add('lamborghini','countach','Countach','Mid-engine sports car','The Countach’s wedge and scissor doors become progressively wider and more ornamented. The later LPI revival is a separate production family on this brand page.', '''
1974|LP400|Lamborghini Countach|LP400|A clean wedge and narrow wheelarches.|A longitudinal mid-mounted V12.
1978|LP400 S / LP500 S|Lamborghini Countach|400.S|Bolt-on arches, wide wheels and a deep front spoiler.|A wider chassis stance and successive V12 developments.
1985|5000 Quattrovalvole|Lamborghini Countach|Quattrovalvole|An enlarged engine-cover bulge changes rearward sightlines.|A four-valve-per-cylinder V12.
1988|25th Anniversary|Lamborghini Countach|Anniversary|Straked side openings and extensive body additions.|The final original-chassis development.
''',inherit='countach')
add('lamborghini','silhouette','Silhouette','Mid-engine sports car','A short-lived open-roof development of Lamborghini’s small V8 line. Its removable roof and flared body differ from the enclosed Urraco.', '''
1976|Silhouette|Lamborghini Silhouette||A removable roof and heavily flared arches.|A transverse mid-mounted V8.
''')
add('lamborghini','jalpa','Jalpa','Mid-engine sports car','The Jalpa develops the Silhouette’s open-roof V8 layout with a larger engine and revised body details. It remains separate from Lamborghini’s V12 flagship line.', '''
1981|Jalpa|Lamborghini Jalpa||An angular targa body, broad arches and large side intakes.|An enlarged transverse mid-mounted V8.
''')
add('lamborghini','lm002','LM002','Off-road vehicle','A four-door off-road production vehicle powered by a Lamborghini V12. Its high bonnet, huge tyres and upright cabin form a separate branch from the sports cars.', '''
1986|LM002|Lamborghini LM002||A high, angular four-door body and very large tyres.|A front V12, four-wheel drive and a heavy off-road chassis.
''')
add('lamborghini','diablo','Diablo','Mid-engine sports car','The Diablo rounds the Countach’s wedge while retaining scissor doors. Open, more aero-focused and fixed-headlight forms show the model’s major body changes.', '''
1990|Original Diablo / VT|Lamborghini Diablo|Early|A rounded wedge with pop-up lamps and broad rear shoulders.|A mid-mounted V12; VT adds four-wheel drive.
1995|VT Roadster|Lamborghini Diablo|Roadster|A removable roof and a redesigned rear engine cover.|An open-body four-wheel-drive V12 model.
1999|Diablo GT|Lamborghini Diablo|Diablo.GT|A roof intake, wider body and more open front aero.|A limited road-legal, rear-wheel-drive performance derivative.
2000|VT 6.0|Lamborghini Diablo|6.0|Fixed lamps, a wider nose and cleaner body surfaces.|A larger V12 and a revised four-wheel-drive chassis.
''',inherit='diablo')
add('lamborghini','murcielago','Murciélago','Mid-engine sports car','Lamborghini’s first new V12 model under Audi ownership keeps scissor doors and a broad wedge. Roadster and SuperVeloce forms substantially change its roof and aero treatment.', '''
2001|Murciélago / LP640|Lamborghini Murciélago|LP640|A broad wedge with adjustable shoulder intakes.|A mid-mounted V12 and four-wheel drive; LP640 develops the same architecture.
2004|Roadster|Lamborghini Murciélago|Roadster|An open cabin and a strongly sculpted rear deck.|A reinforced open-body V12 chassis.
2009|LP670-4 SuperVeloce|Lamborghini Murciélago|670|Large aero devices, a fixed wing and a revised engine cover.|A lighter road-going performance derivative.
''')
add('lamborghini','gallardo','Gallardo','Mid-engine sports car','The V10 Gallardo creates a smaller series-production Lamborghini line. Its coupé, Spyder and later sharper-nosed bodies record a decade of development.', '''
2003|Gallardo coupé|Lamborghini Gallardo|200[3-7]|A compact angular body with upright lamp units.|A mid-mounted V10 and a compact all-wheel-drive platform.
2006|Gallardo Spyder|Lamborghini Gallardo|Spyder|A fabric folding roof and a new rear deck.|The V10 architecture in an open-body model.
2008|LP560-4 / LP550-2|Lamborghini Gallardo|560|Sharper nose openings and revised lamp graphics.|A larger V10; later versions include rear-wheel drive.
2010|LP570-4 Superleggera|Lamborghini Gallardo|Superleggera|A fixed wing, more open aero and exposed carbon details.|A lighter road-legal performance specification.
''')
add('lamborghini','reventon','Reventón','Limited-production sports car','A low-volume V12 family with sharply faceted bodywork. Coupé and Roadster versions are road cars; they are distinguished from show cars and single commissions.', '''
2007|Reventón coupé|Lamborghini Reventón|Revent|Flat facets, angular air openings and aircraft-like instruments.|A Murciélago-derived V12 chassis.
2009|Reventón Roadster|Lamborghini Reventón|Roadster|The faceted body loses its fixed roof.|An open V12 development in the limited series.
''')
add('lamborghini','aventador','Aventador','Mid-engine sports car','A carbon-bodied V12 flagship whose angular shape becomes increasingly aero-focused. The open roof and SVJ wing treatment are distinct design chapters.', '''
2011|LP700-4 / S|Lamborghini Aventador|LP700|A faceted wedge with large hexagonal intakes.|A carbon monocoque and a new V12; S adds further chassis development.
2012|Roadster|Lamborghini Aventador|Roadster|Removable roof panels and revised rear-deck surfaces.|An open version of the carbon-chassis V12 car.
2015|SuperVeloce|Lamborghini Aventador|750|A large fixed wing and exposed aero additions.|A lighter road-going performance version.
2018|SVJ|Lamborghini Aventador|SVJ|A slotted nose and large rear wing.|ALA active aerodynamics develops the V12 flagship.
''',inherit='aventador')
add('lamborghini','veneno','Veneno','Limited-production sports car','A small road-going series with prominent aero structures and a spine-like centre line. Coupé and Roadster versions share an Aventador-derived mechanical basis.', '''
2013|Veneno coupé|Lamborghini Veneno|Veneno|A central fin, large rear wing and highly open body surfaces.|An Aventador-derived carbon chassis and V12.
2014|Veneno Roadster|Lamborghini Veneno|Roadster|A permanently open cabin within the aero-heavy body.|A limited open-body V12 road car.
''')
add('lamborghini','huracan','Huracán','Mid-engine sports car','The Huracán develops Lamborghini’s smaller V10 line. The STO’s exposed aero and the raised Sterrato body extend the range well beyond the original coupé.', '''
2014|LP610-4 / Evo|Lamborghini Huracán|Evo|A low, compact wedge with narrow lamps.|A mid-mounted V10; Evo develops the chassis and control systems.
2015|Spyder|Lamborghini Huracán|Spyder|A folding fabric roof and revised rear deck.|An open V10 chassis.
2017|Performante|Lamborghini Huracán|Performante|A large rear wing and more exposed composite aero.|ALA active aerodynamics and a lighter specification.
2020|STO|Lamborghini Huracán|STO|A roof intake, fin, large wing and one-piece front clamshell.|A rear-wheel-drive road model inspired by competition hardware.
2022|Tecnica|Lamborghini Huracán|Tecnica|Revised nose openings and a smaller fixed rear wing.|A rear-wheel-drive model between the standard car and STO.
2022|Sterrato|Lamborghini Huracán|Sterrato|Raised suspension, arch cladding and extra roof intake.|A limited all-surface road-going derivative.
''')
add('lamborghini','centenario','Centenario','Limited-production sports car','A limited V12 road-car family with deeply cut aero surfaces. Coupé and Roadster bodies mark the centenary of Ferruccio Lamborghini’s birth.', '''
2016|Centenario coupé|Lamborghini Centenario|Centenario|A low body with deep aero channels and a large rear diffuser.|An Aventador-derived V12 chassis with rear-wheel steering.
2016|Centenario Roadster|Lamborghini Centenario|Roadster|An open cabin within the same deeply channelled body.|An open limited-series V12 road car.
''')
add('lamborghini','urus','Urus','SUV','The Urus brings a turbocharged V8 into a high-volume five-door Lamborghini. Performante and plug-in-hybrid SE versions change the body details and powertrain.', '''
2017|Urus / S|Lamborghini Urus|Urus|An angular five-door SUV body and a low roofline.|A front turbo V8 and four-wheel drive.
2022|Performante|Lamborghini Urus|Performante|A vented bonnet, revised bumpers and additional aero.|A lowered, lighter road-going SUV specification.
2024|SE|Lamborghini Urus|SE|A revised bonnet, slimmer lighting and a new rear treatment.|A plug-in hybrid turbo-V8 powertrain.
''')
add('lamborghini','sian','Sián FKP 37','Limited-production hybrid','A limited V12 hybrid family that uses a supercapacitor for its electrical assistance. Its low roof, hexagonal rear lamps and open-roadster derivative distinguish it from the Aventador.', '''
2019|Sián FKP 37|Lamborghini Sián FKP 37|Sian|A sharply channelled body and six hexagonal rear lights.|A V12 with supercapacitor-based electrical assistance.
2020|Sián Roadster|Lamborghini Sián FKP 37|Roadster|A permanently open roof within the hybrid body.|An open development of the limited hybrid series.
''')
add('lamborghini','countach-lpi','Countach LPI 800-4','Limited-production hybrid','A separate modern revival of the Countach name, rather than a continuation of the 1970s chassis. Its body recalls the early wedge on a larger V12 hybrid platform.', '''
2021|Countach LPI 800-4|Lamborghini Countach LPI 800-4||A wedge-shaped nose, rectangular openings and a smooth roof arc.|An Aventador-related V12 platform with supercapacitor hybrid assistance.
''')
add('lamborghini','revuelto','Revuelto','Plug-in hybrid sports car','The Revuelto succeeds the Aventador with a plug-in hybrid system and a new carbon structure. Y-shaped graphics and an exposed V12 become central to its appearance.', '''
2023|Revuelto|Lamborghini Revuelto||Y-shaped lighting and an exposed upper engine installation.|A V12 plug-in hybrid with three electric motors.
''')
add('lamborghini','temerario','Temerario','Plug-in hybrid sports car','The Temerario replaces the Huracán’s naturally aspirated V10 with a turbocharged V8 hybrid. Its compact two-seat body continues Lamborghini’s smaller mid-engined line.', '''
2024|Temerario|Lamborghini Temerario||Hexagonal lighting details and a low, broad mid-engine body.|A turbocharged V8 plug-in hybrid with three electric motors.
''')
add('lamborghini','fenomeno','Fenomeno','Limited-production hybrid','A road-going few-off derived from Lamborghini’s V12 hybrid programme. Its production-series announcement is separate from one-off commissions such as Invencible and Auténtica.', '''
2025|Fenomeno|Lamborghini Fenomeno||A redesigned nose, large front channels and a new rear lighting treatment.|A limited-series V12 hybrid road car.
''')
# Porsche: named road families; 930 and modern 718 stay within their parent lineages.
add('porsche','356','356','Sports car','Porsche’s first series-production sports-car family evolves through Pre-A, A, B and C forms. Open Speedster and later Cabriolet bodies belong to the same rear-engined lineage.', '''
1948|356 Pre-A|Porsche 356|Pre.A|A compact rounded coupé with a split or bent windscreen on early cars.|An air-cooled rear engine and rear-wheel drive.
1955|356 A|Porsche 356|356.A|A curved windscreen and revised body details.|A developed rear-engined chassis.
1959|356 B|Porsche 356|356.B|Higher bumpers and a revised nose.|Continued development of the air-cooled platform.
1963|356 C|Porsche 356|356.C|The late body with revised wheels and details.|Disc brakes distinguish the final principal series.
''')
add('porsche','550','550 Spyder','Homologation road car','The small mid-engined 550 was built for sports-car competition but also existed in road-capable form. Only the road-capable production family is represented here.', '''
1953|550 Spyder|Porsche 550||A small open aluminium body with a very low windscreen.|A mid-mounted flat-four in a lightweight chassis.
''')
add('porsche','718-rsk','718 RSK / RS60 / RS61','Homologation road car','The original 718 name belongs to road-capable sports-racing cars of the late 1950s and early 1960s. It is kept separate from the modern Boxster/Cayman nameplate revival.', '''
1957|718 RSK|Porsche 718|RSK|A small open sports-racing body.|A mid-mounted air-cooled flat-four.
1960|718 RS60 / RS61|Porsche 718|RS60|Revised open bodywork and a taller windscreen.|A developed sports-racing chassis; race-only formula derivatives are excluded.
''')
add('porsche','904','904 Carrera GTS','Homologation road car','A GT homologation car with a low, enclosed body. Its small road-going series sits between Porsche’s open sports-racing cars and later racing prototypes.', '''
1963|904 Carrera GTS|Porsche 904||A low coupé body with a compact cabin and small side intakes.|A mid-engine chassis with bonded glassfibre bodywork.
''')
add('porsche','911','911 / Turbo','Sports car','Porsche’s rear-engined sports-car line evolves through air-cooled and water-cooled generations. Turbo, GT and open bodies remain inside this family rather than becoming duplicate main entries.', '''
1963|Original 911 / F series|Porsche 911 (classic)|196[3-9]|A narrow body, round lamps and a fastback roof.|An air-cooled rear-mounted flat-six.
1973|G series / 930 Turbo|Porsche 911 (classic)|930|Impact bumpers; Turbo versions add broad arches and a large rear spoiler.|The air-cooled platform gains turbocharged road versions.
1988|964|Porsche 964||Integrated bumpers and a deployable rear spoiler.|A substantially revised chassis with optional four-wheel drive.
1993|993|Porsche 993||Lower front wings and more integrated body surfaces.|The final principal air-cooled 911 generation.
1997|996|Porsche 996||A larger body and combined headlamp units.|Water cooling replaces the air-cooled engine.
2004|997|Porsche 997||Rounder lamps and a more traditional-looking front.|A development of the water-cooled rear-engine layout.
2011|991|Porsche 991||A longer wheelbase and lower-looking roof.|A new platform with a broader footprint.
2018|992|Porsche 992||A full-width rear light bar and a wider body.|The latest principal rear-engine platform; later powertrain updates remain grouped.
''',inherit='911')
add('porsche','906','906 Carrera 6','Homologation road car','A small road-capable homologation series links Porsche’s GT cars and prototype racers. Race-only engine and body derivatives are outside this road-car entry.', '''
1966|906 Carrera 6|Porsche 906||A low glassfibre coupé with gullwing doors.|A mid-mounted flat-six and a tubular chassis.
''')
add('porsche','912','912 / 912E','Sports car','The 912 uses a four-cylinder engine in the early 911 body. A later 912E briefly revisits the formula for the American market.', '''
1965|912|Porsche 912|912|The early narrow 911 body with four-cylinder identification.|An air-cooled rear-mounted flat-four.
1976|912E|Porsche 912|912E|The later impact-bumper body.|A fuel-injected flat-four in a short-run road model.
''')
add('porsche','914','914 / 914-6','Sports car','A joint Volkswagen-Porsche project with a mid-engine layout and removable roof. Four- and six-cylinder road versions share the same basic body.', '''
1969|914 / 914-6|Porsche 914||A low central cabin, removable roof and upright rear screen.|A mid-mounted flat-four or flat-six; race-only prototypes are excluded.
''')
add('porsche','924','924','Sports car','The 924 begins Porsche’s front-engined, water-cooled transaxle line. Turbo and Carrera GT bodies add progressively larger cooling openings and arches.', '''
1976|924 / 924S|Porsche 924|924|A low nose and a large glass rear hatch.|A front four-cylinder engine and rear transaxle.
1978|924 Turbo|Porsche 924|Turbo|Bonnet and nose cooling openings.|A turbocharged development of the transaxle layout.
1980|924 Carrera GT|Porsche 924|Carrera|Flared arches, a bonnet scoop and revised front aero.|A limited road-going homologation model.
''')
add('porsche','928','928','Grand tourer','A front-V8 grand tourer with a rounded hatchback body. Later S4, GT and GTS models revise the nose, rear treatment and powertrain.', '''
1977|928 / S|Porsche 928|197[7-9]|A rounded hatchback body and exposed pop-up headlamps.|A front V8 and rear transaxle.
1986|S4 / GT / GTS|Porsche 928|S4|Smoother bumpers and revised rear lighting.|A developed V8 and transaxle package; GTS is the final principal road version.
''')
add('porsche','944','944','Sports car','The 944 develops the 924’s transaxle layout with much wider arches. Turbo and S2 nose treatments make the later cars visibly different.', '''
1982|944 / S|Porsche 944|198[2-5]|Broad squared wheelarches around the glass-hatch body.|A Porsche-designed front four-cylinder engine and rear transaxle.
1985|944 Turbo / S2|Porsche 944|Turbo|A more integrated, rounded front bumper.|Turbocharged or larger naturally aspirated engines in the transaxle platform.
1989|944 S2 Cabriolet|Porsche 944|Cabriolet|A folding fabric roof replaces the large rear hatch.|A reinforced open-body version of the S2.
''')
add('porsche','959','959','Supercar','Porsche’s technical flagship uses a wide, integrated body over an advanced four-wheel-drive platform. Komfort and Sport specifications remain in one body chapter.', '''
1986|959 Komfort / Sport|Porsche 959|Front|Integrated rear arches and a body-coloured rear wing.|Turbocharging, variable four-wheel drive and advanced suspension.
''',inherit='959')
add('porsche','968','968','Sports car','The final principal development of Porsche’s four-cylinder transaxle line uses exposed round pop-up lamps and a smoother body. Coupé and Cabriolet forms share the layout.', '''
1991|968 coupé / Club Sport|Porsche 968|Coupe|Round exposed pop-up lamps and a smoother glass-hatch body.|A front four-cylinder engine and rear transaxle; Club Sport is grouped here.
1991|968 Cabriolet|Porsche 968|Cabriolet|A folding roof and conventional boot replace the hatch.|The same transaxle concept in an open body.
''')
add('porsche','boxster','Boxster / Cayman / modern 718','Sports car','The Boxster roadster and Cayman coupé share Porsche’s smaller mid-engine platform. The revived 718 badge belongs to their later generation, not to the original 1950s sports-racer chassis.', '''
1996|986 Boxster|Porsche Boxster and Cayman|986|An open two-seater with rounded, combined lamp units.|A mid-mounted water-cooled flat-six.
2004|987 Boxster|Porsche Boxster and Cayman|987|More separate-looking lamps and revised side openings.|A developed mid-engine platform.
2005|987 Cayman|Porsche Boxster and Cayman|Cayman|A fixed coupé roof and a large rear hatch.|A closed-body companion to the Boxster.
2012|981 Boxster / Cayman|Porsche Boxster and Cayman|981|A wider stance and deeply sculpted side intakes.|A new mid-engine platform.
2016|982 / 718 Boxster and Cayman|Porsche 982||Revised lamps and air openings in roadster and coupé bodies.|Turbo flat-fours join the range; later GT/GTS versions use flat-sixes.
''')
add('porsche','911-gt1','911 GT1 Straßenversion','Homologation road car','Despite its name, the road-going GT1 is a mid-engined homologation car. Race-only GT1 chassis are excluded; the small road series is shown separately from the production 911 lineage.', '''
1996|911 GT1 Straßenversion|Porsche 911 GT1|Stra|A long mid-engine body with 911-related lamp styling.|A mid-mounted turbo flat-six in a homologation chassis.
''')
add('porsche','cayenne','Cayenne','SUV','Porsche’s SUV develops through three combustion-platform generations and a new electric branch. Coupé bodies and electrification sit within the Cayenne family.', '''
2002|955 / 957|Porsche Cayenne|955|An upright SUV body with Porsche-like front wings.|A front-engine four-wheel-drive platform.
2010|958|Porsche Cayenne|958|A lower-looking, more sculpted body.|A lighter second-generation platform with hybrid derivatives.
2017|9Y0 / E3|Porsche Cayenne|201[7-9]|A broader rear light treatment and sharper body surfaces.|A third-generation combustion/hybrid SUV platform.
2019|Cayenne Coupé|Porsche Cayenne|Coupe|A sloping coupé-like roof within the SUV format.|A body derivative of the E3 platform.
2025|Cayenne Electric|Porsche Cayenne Electric||A dedicated electric SUV body and cabin.|A separate battery-electric platform within the Cayenne nameplate.
''')
add('porsche','carrera-gt','Carrera GT','Supercar','An open-roof V10 supercar with a carbon structure. Its removable roof panels and metal-mesh engine cover expose a different design approach from Porsche’s rear-engined 911.', '''
2003|Carrera GT|Porsche Carrera GT||A low open-roof body, removable panels and a mesh rear deck.|A mid-mounted V10, carbon structure and manual gearbox.
''')
add('porsche','panamera','Panamera','Grand tourer','The Panamera takes Porsche’s sporting body language into a large four-door car. The Sport Turismo provides a separate estate-roof interpretation within the second generation.', '''
2009|970|Porsche Panamera|970|A large four-door fastback with a high rounded tail.|A front-engine touring platform.
2016|971|Porsche Panamera|971|A lower-looking roof arc and full-width rear lighting.|A second-generation touring platform with plug-in hybrids.
2017|Sport Turismo|Porsche Panamera|Turismo|An extended roof and larger rear opening.|An estate body on the second-generation platform.
2023|976|Porsche Panamera|202[3-6]|A revised nose and cleaner, more angular body details.|A new generation with further hybrid and active-suspension development.
''')
add('porsche','918','918 Spyder','Hybrid supercar','The 918 combines a mid-mounted V8 with electric drive and an open-roof body. Its high exhaust outlets and removable roof panels give it a distinctive profile.', '''
2013|918 Spyder|Porsche 918 Spyder||High-mounted exhaust outlets and removable roof panels.|A V8 plug-in hybrid with electric front-axle drive.
''')
add('porsche','macan','Macan','SUV','The Macan starts as a compact combustion-engined SUV, then gains a dedicated electric generation. The two platforms overlap rather than representing a simple engine swap.', '''
2014|95B|Porsche Macan|95B|A compact five-door SUV with a descending roofline.|A front-engine platform with four-wheel drive.
2024|Electric / XAB|Porsche Macan||Split front lighting and a more streamlined rear body.|A dedicated battery-electric platform.
''')
add('porsche','taycan','Taycan','Electric grand tourer','Porsche’s first series-production battery-electric family includes a low saloon and longer-roof Turismo bodies. The 2024 update retains the underlying silhouette.', '''
2019|Taycan saloon|Porsche Taycan|2020|A low four-door body with sculpted front wings.|An 800-volt battery-electric platform.
2021|Cross Turismo / Sport Turismo|Porsche Taycan|Turismo|A longer estate roof; Cross Turismo adds cladding and extra ground clearance.|Estate-body versions of the electric platform.
''',inherit='taycan')
# Tesla: passenger road vehicles; Semi and prototype-only future models excluded.
add('tesla','roadster','Roadster','Electric sports car','Tesla’s first production car uses a Lotus-derived open sports-car body and battery-electric power. Later Sport and 2.5 updates retain the same principal design.', '''
2008|Original Roadster / Sport / 2.5|Tesla Roadster (first generation)|Roadster|A compact open two-seater with side cooling intakes.|A Lotus-derived structure repackaged around a battery and electric motor.
''',inherit='roadster')
add('tesla','model-s','Model S','Electric liftback','The Model S combines a large five-door body with electric power and a touchscreen-led cabin. Its nose and later interior redesigns mark the main visual chapters.', '''
2012|Original Model S|Tesla Model S|201[2-5]|A dark nose panel and tall central portrait screen.|A battery-electric liftback platform.
2016|Revised nose|Tesla Model S|201[6-9]|A smaller grille-free nose opening.|The same body platform with developed electric drivetrains.
2021|Cabin redesign / Plaid|Tesla Model S|Plaid|A horizontal central display and revised cabin controls.|A redesigned cabin; Plaid adds a three-motor drivetrain.
''',inherit='model-s')
add('tesla','model-x','Model X','Electric SUV','The Model X combines a tall electric SUV body with roof-hinged rear doors. The 2021 cabin update changes the interface while retaining the main body design.', '''
2015|Original Model X|Tesla Model X|201[5-9]|A tall body with roof-hinged Falcon Wing rear doors.|An electric SUV platform with a low battery pack.
2021|Cabin redesign / Plaid|Tesla Model X|Plaid|A horizontal centre display and revised steering controls.|A revised cabin and updated electric drivetrains.
''')
add('tesla','model-3','Model 3','Electric saloon','Tesla’s smaller saloon centres its cabin on one display. The Highland redesign changes the lighting, cabin details and control arrangement.', '''
2017|Original Model 3|Tesla Model 3|2019|A smooth nose and bare dashboard centred on one screen.|A battery-electric saloon platform.
2023|Highland|Tesla Model 3|2023|Slimmer lamps and revised rear lighting; a new cabin light strip.|Updated suspension, sound insulation and cabin controls.
''',inherit='model-3')
add('tesla','model-y','Model Y','Electric crossover','The Model Y extends Tesla’s compact electric platform into a taller five-door body. The Juniper redesign and longer Model Y L provide distinct later forms.', '''
2020|Original Model Y|Tesla Model Y|202[0-4]|A high roof and hatchback body related to the Model 3.|A battery-electric crossover platform.
2025|Juniper|Tesla Model Y|Juniper|Full-width front and rear lighting change the face and tail.|A revised cabin and updated crossover platform.
2025|Model Y L|Tesla Model Y|Model.Y.L|A longer body and taller rear passenger area.|A longer-wheelbase six-seat body variant.
''')
add('tesla','cybertruck','Cybertruck','Electric pickup','Tesla’s personal-use pickup uses exposed stainless-steel panels and a sharply faceted body. The road production car is dated from 2023, rather than the 2019 prototype reveal.', '''
2023|Production Cybertruck|Tesla Cybertruck|202[3-6]|Flat stainless-steel panels, a triangular roof and a full-width light strip.|A battery-electric pickup platform with steer-by-wire.
''',inherit='cybertruck')
add('tesla','cybercab','Cybercab','Electric passenger vehicle','A purpose-built two-seat autonomous passenger vehicle. Tesla’s 2026 production start is recorded separately from its 2024 presentation; its proposed driverless use is not a claim of unrestricted road approval.', '''
2026|Production programme|Tesla Cybercab||A two-seat body with butterfly doors and no conventional driver controls.|A dedicated electric autonomous-passenger-vehicle programme.
''')
# Mercedes-Benz: 1926 merger onward; legacy names grouped into documented lineages.
add('mercedes','400','400 / 24-100-140 PS','Luxury car','A large supercharged touring model inherited from the pre-merger Mercedes programme. The page dates the Mercedes-Benz-branded continuation from the 1926 merger.', '''
1926|400 / 24-100-140 PS|Mercedes 24/100/140 PS||A tall touring body with a long bonnet and separate wings.|A supercharged front six-cylinder engine; the design predates the merger.
''')
add('mercedes','630','630 / 24-100-140 PS K','Luxury car','The shorter-wheelbase K/630 branch of Mercedes-Benz’s early supercharged six-cylinder touring range. Coachbuilt bodies vary considerably within the model.', '''
1926|630 / K|Mercedes-Benz 630||A long-bonnet touring chassis with shorter-wheelbase proportions.|A supercharged six-cylinder engine and coachbuilt body options.
''')
add('mercedes','stuttgart','8/38 PS / Stuttgart 200 / 260','Touring car','Mercedes-Benz’s early medium-sized touring line develops through the W02 and W11 chassis. The numerical names refer to different engines and revisions within that lineage.', '''
1926|8/38 PS / W02|Mercedes-Benz W02||An upright body with separate wings and running boards.|A front six-cylinder touring chassis.
1929|Stuttgart 200 / 260 / W11|Mercedes-Benz W11||A developed upright touring body on a longer chassis.|Revised six-cylinder engines in the Stuttgart line.
''')
add('mercedes','300-350','300 / 350 W03-W05','Luxury car','An early six-cylinder Mercedes-Benz touring family, revised through successive chassis codes before the Mannheim line. The model index retains each principal code.', '''
1926|300 / W03|Mercedes-Benz W03||A tall coachbuilt touring body.|A front six-cylinder engine.
1927|300 / W04|Mercedes-Benz W04||Revised touring proportions and details.|A developed six-cylinder chassis.
1928|350 / W05|Mercedes-Benz W05||A continuation of the large upright touring body.|An enlarged six-cylinder engine.
''')
add('mercedes','s-series','S / SS / SSK / SSKL','Supercharged sports car','The supercharged S family spans touring and short-wheelbase sports bodies. Road-capable production derivatives are included; competition-only individual cars are not cataloged separately.', '''
1927|S / W06|Mercedes-Benz S-Series|S.Tourer|A long bonnet and separate wings over a lowered chassis.|A supercharged six-cylinder sports-touring platform.
1928|SS / SSK|Mercedes-Benz SSK|SSK|A shortened open body gives the SSK more compact proportions.|A larger supercharged six-cylinder engine; SSK shortens the wheelbase.
1931|SSKL|Mercedes-Benz SSK|SSKL|A stripped lightweight short-wheelbase form.|A small lightweight development of the supercharged family.
''')
add('mercedes','nurburg','Nürburg 460 / 500','Luxury car','The Nürburg line adds an eight-cylinder engine to Mercedes-Benz’s large touring range. Open and closed coachbuilt bodies share the W08 lineage.', '''
1928|Nürburg 460|Mercedes-Benz W08|460|A substantial upright touring body with a long bonnet.|A front straight-eight engine.
1931|Nürburg 500|Mercedes-Benz W08|500|Revised body and chassis details retain the tall touring form.|An enlarged straight-eight engine.
''')
add('mercedes','mannheim','Mannheim / 380 S','Grand tourer','The Mannheim six-cylinder range develops into shorter sporting versions and the W19 380 S. It is separate from the later supercharged W22 380.', '''
1929|Mannheim 350 / 370 / 380|Mercedes-Benz W10||Long-bonnet touring and cabriolet bodies.|A front six-cylinder chassis with several wheelbase and engine versions.
1932|380 S / W19|Mercedes-Benz W19||A shorter sporting touring body.|A straight-eight Mannheim-related sporting chassis.
''')
add('mercedes','770','770 Großer Mercedes','Luxury car','The 770 was a large eight-cylinder flagship produced before and during the Second World War. Its role in Nazi state use is part of its history, alongside its coachbuilt luxury-car design.', '''
1930|770 / W07|Mercedes-Benz 770|W07|Very large upright saloon and cabriolet bodies.|A straight-eight flagship chassis with supercharged versions.
1938|770 / W150|Mercedes-Benz 770|W150|A broader, more integrated large-body form.|A revised large straight-eight chassis.
''')
add('mercedes','170','170 / W15','Touring car','The compact six-cylinder 170 introduces a smaller Mercedes-Benz touring car in the early 1930s. It is distinct from the later 170 V and rear-engined 170 H.', '''
1931|170 / W15|Mercedes-Benz W15||A compact upright touring body.|A front six-cylinder engine and independent suspension.
''')
add('mercedes','200','200 / W21','Touring car','The W21 develops the smaller six-cylinder touring range with a larger engine and body. It precedes the 230 models rather than the later postwar 200 badges.', '''
1933|200 / W21|Mercedes-Benz W21||A taller six-cylinder touring body with separate wings.|A front six-cylinder engine in standard and longer chassis forms.
''')
add('mercedes','290','290 / W18','Luxury car','The 290 was a six-cylinder touring car available with several coachbuilt bodies. Its wheelbase and body range bridge smaller touring cars and the largest Mercedes-Benz flagships.', '''
1933|290 / W18|Mercedes-Benz W18||Long-bonnet saloon, touring and cabriolet bodies.|A front six-cylinder luxury touring chassis.
''')
add('mercedes','380','380 / W22','Supercharged grand tourer','The W22 380 introduces an eight-cylinder supercharged grand-touring line that leads toward the 500 K. It is distinguished from the earlier Mannheim-related 380 S.', '''
1933|380 / W22|Mercedes-Benz 380 (1933)||A long bonnet, sweeping separate wings and coachbuilt open bodies.|A straight-eight engine with supercharged specifications.
''')
add('mercedes','rear-engine','130 / 150 / 170 H','Rear-engine car','An unusual rear-engined branch of prewar Mercedes-Benz. The small 130 and 170 H saloons are shown alongside the limited 150 roadster programme; prototype-only saloon experiments are excluded.', '''
1934|130 / W23|Mercedes-Benz 130||A rounded small saloon with a short front bonnet.|A rear-mounted four-cylinder engine.
1935|150 Roadster / W30|Mercedes-Benz 150||A small open two-seater with a rounded nose.|A mid/rear-engine roadster programme built in very small numbers.
1936|170 H / W28|Mercedes-Benz 130||A larger rounded rear-engined saloon.|A developed rear-mounted four-cylinder layout.
''')
add('mercedes','500k','500 K / 540 K','Supercharged grand tourer','The W29 family supports some of Mercedes-Benz’s best-known long-bonnet cabriolet and roadster bodies. The 540 K enlarges the engine while retaining the broad chassis and coachbuilding concept.', '''
1934|500 K|Mercedes-Benz 500K||A very long bonnet and sweeping wings on several coachbuilt bodies.|A supercharged straight-eight and independent suspension.
1936|540 K|Mercedes-Benz 540K||Developed cabriolet and roadster bodies on the W29 chassis.|An enlarged supercharged straight-eight engine.
''')
add('mercedes','170v','170 V / 170 S','Touring car','The front-engined 170 V becomes central to Mercedes-Benz’s postwar restart. The more spacious 170 S forms a later touring branch; engine and taxi specifications stay within those bodies.', '''
1936|170 V / W136|Mercedes-Benz 170 V||A separate-wing saloon body carried from the prewar period into postwar production.|A front four-cylinder engine; later diesel variants share the body family.
1949|170 S / W191|Mercedes-Benz 170 S||A wider body and more spacious cabin.|A larger touring development of the 170 range.
''')
add('mercedes','260d','260 D','Diesel touring car','The 260 D is an early series-production diesel passenger car. The engine installation sits within a conventional six-seat touring body rather than a radically new exterior.', '''
1936|260 D / W138|Mercedes-Benz 260 D||An upright saloon and touring body with separate wings.|A diesel four-cylinder engine in a passenger-car chassis.
''')
add('mercedes','230','230 / W143 / W153','Touring car','The prewar 230 line develops the medium-sized six-cylinder Mercedes-Benz. W153 bodies become more integrated as styling moves away from the earlier upright forms.', '''
1937|230 / W143|Mercedes-Benz W143||A separate-wing saloon or cabriolet with upright proportions.|A front six-cylinder touring platform.
1938|230 / W153|Mercedes-Benz W153||More integrated, flowing body surfaces.|A revised six-cylinder chassis.
''')
add('mercedes','320','320 / W142','Luxury car','The 320 succeeds the 290 with a six-cylinder touring chassis and a wide range of bodies. Cab, saloon and cabriolet specifications are grouped within the same production family.', '''
1937|320 / W142|Mercedes-Benz W142||Long, flowing separate-wing touring bodies.|A front six-cylinder luxury chassis.
''')
add('mercedes','adenauer','300 Adenauer','Luxury car','The postwar 300 flagship retains a formal separate-wing outline while adding modern suspension and luxury fittings. The later 300 d lengthens and revises the body.', '''
1951|300 / W186|Mercedes-Benz W186||A large formal saloon with separate rear wings.|A front six-cylinder flagship chassis.
1957|300 d / W189|Mercedes-Benz W189||A longer body and a more open side-window treatment.|A developed fuel-injected six-cylinder flagship.
''')
add('mercedes','300s','300 S / Sc','Grand tourer','The W188 offers exclusive coupé, cabriolet and roadster bodies related to the larger 300 touring programme. It is a separate family from the sports-car 300 SL.', '''
1951|300 S / W188|Mercedes-Benz W188|300.S|Formal two-door coupé, cabriolet and roadster bodies.|A front six-cylinder luxury touring layout.
1955|300 Sc|Mercedes-Benz W188|Sc|The same principal body family with detail revisions.|Fuel injection develops the six-cylinder powertrain.
''')
add('mercedes','s-class','220 / S-Class lineage','Luxury car','The luxury saloon lineage runs from postwar 220 models through Ponton and fintail bodies to the formally named S-Class. Coupé derivatives later marketed as SEC, S Coupé and CL are indexed in their own family.', '''
1951|220 / W187|Mercedes-Benz W187||A six-cylinder saloon retaining separate wings.|A front six-cylinder postwar luxury chassis.
1954|220 / W180 / W128 Ponton|Mercedes-Benz W180||Integrated wings and a rounded three-box body.|A six-cylinder unitary-body luxury saloon.
1959|W111 / W112 fintail saloon|Mercedes-Benz W111|sedan|Small rear fins and a more angular glasshouse.|A safety-cell body; W112 adds a higher luxury specification.
1965|W108 / W109|Mercedes-Benz W108||A clean three-box body with a broad glasshouse.|A developed luxury-saloon chassis with six- and eight-cylinder engines.
1972|W116|Mercedes-Benz W116||Horizontal lamps and a broad, angular body.|The first formally named S-Class generation.
1979|W126|Mercedes-Benz W126||Smoother integrated bumpers and a restrained wedge profile.|A lighter, more aerodynamic luxury platform.
1991|W140|Mercedes-Benz W140||A large upright body with substantial glazing and pillars.|A new flagship platform with extensive electronic systems.
1998|W220|Mercedes-Benz W220||A lower, more rounded body and curved headlamps.|A more compact-looking electronically managed luxury platform.
2005|W221|Mercedes-Benz W221||Pronounced wheelarches and an arcing roofline.|A larger luxury platform with new safety and cabin systems.
2013|W222|Mercedes-Benz W222||A flowing body and broad rear shoulders.|A luxury platform with hybrid and driver-assistance derivatives.
2015|Mercedes-Maybach S-Class|Mercedes-Maybach S-Class|2015|A longer rear cabin and more formal side-window treatment.|An extended-wheelbase luxury derivative; Pullman bodies are grouped here.
2020|W223|Mercedes-Benz S-Class (W223)||Smooth sides, slim lamps and a portrait central display.|A new flagship platform with rear-steering and hybrid versions.
''')
add('mercedes','e-class','Ponton / fintail / E-Class lineage','Executive car','Mercedes-Benz’s medium-sized saloon lineage evolves through Ponton, fintail and numbered chassis families before adopting the E-Class name. Estates and coupé/cabriolet bodies are indexed within the corresponding generation.', '''
1953|180 / 190 / W120-W121 Ponton|Mercedes-Benz W120||Rounded integrated wings and a compact three-box saloon body.|A four-cylinder unitary-body platform; petrol and diesel models.
1956|219 / W105|Mercedes-Benz W105||A six-cylinder nose combined with the smaller Ponton cabin.|A bridge between four-cylinder Ponton and larger six-cylinder models.
1961|W110 fintail|Mercedes-Benz W110||Angular bodywork and small rear fins.|A compact safety-cell saloon platform.
1968|W114 / W115 Stroke Eight|Mercedes-Benz W114||A restrained three-box body with vertical front lamps.|Four-, five- and six-cylinder executive-car chassis.
1976|W123|Mercedes-Benz W123||Broad horizontal lamps and rounded body edges.|A long-lived executive platform with saloon, estate and coupé bodies.
1984|W124|Mercedes-Benz W124||A cleaner aerodynamic wedge and a high rear deck.|A new executive platform later renamed E-Class.
1995|W210|Mercedes-Benz E-Class (W210)||Four oval front lamps and a rounded body.|A new executive-car generation.
2002|W211|Mercedes-Benz E-Class (W211)||Four-lamp graphics within more sculpted bodywork.|An updated executive platform with new electronic systems.
2009|W212|Mercedes-Benz E-Class (W212)||Angular paired lamps and strongly defined rear haunches.|A new executive platform with estate and related coupé/cabriolet bodies.
2016|W213|Mercedes-Benz E-Class (W213)||A smoother body and a broad, screen-led cabin.|A new executive platform with extensive assistance systems.
2023|W214|Mercedes-Benz E-Class (W214)||A dark grille surround and new lamp graphics.|An executive platform offering mild and plug-in hybrid systems.
''')
add('mercedes','sl','SL','Sports grand tourer','The SL line runs from the 300 SL Gullwing through successive open grand tourers. The original 190 SL is indexed separately because it used a different chassis and engine.', '''
1954|300 SL Gullwing / W198|Mercedes-Benz 300 SL|Gullwing|Roof-hinged doors and a low coupé cabin.|A tubular frame and fuel-injected six-cylinder engine.
1957|300 SL Roadster|Mercedes-Benz 300 SL|Roadster|An open roof and conventional doors.|A revised frame permits lower sills.
1963|Pagoda / W113|Mercedes-Benz W113||A compact roadster with a concave removable hardtop.|A front six-cylinder touring chassis.
1971|R107|Mercedes-Benz R107 and C107|R107|A long-lived roadster body with a removable hardtop.|Six- and eight-cylinder front engines; the SLC coupé is indexed separately.
1989|R129|Mercedes-Benz SL-Class (R129)||An angular body with an integrated folding fabric roof.|A new roadster platform with an automatic rollover bar.
2001|R230|Mercedes-Benz SL-Class (R230)||A folding metal roof replaces the fabric top.|A new grand-touring roadster platform.
2012|R231|Mercedes-Benz SL-Class (R231)||An aluminium-bodied roadster with a folding hardtop.|A lighter luxury-roadster structure.
2021|R232 / Mercedes-AMG SL|Mercedes-AMG SL (R232)||A fabric roof returns over a 2+2 cabin.|An AMG-developed platform with four-wheel-drive versions.
2024|Mercedes-Maybach SL|Mercedes-Maybach SL-Class||A two-seat open body with model-specific luxury trim and rear deck.|A luxury derivative of the R232 platform.
''',inherit='300sl')
add('mercedes','190sl','190 SL','Roadster','An accessible companion to the 300 SL, using a separate four-cylinder platform. Its open body shares family styling rather than the Gullwing’s chassis.', '''
1955|190 SL / R121|Mercedes-Benz 190 SL||A rounded open body with an optional removable hardtop.|A front four-cylinder engine on a touring-derived platform.
''')
add('mercedes','two-door-luxury','220 SE Coupé / SEC / CL / S Coupé','Luxury coupé','Mercedes-Benz’s large two-door luxury lineage spans the W111 coupés, S-Class-based SEC/CL generations and the later S Coupé/Cabriolet. It is distinct from the shorter CLK and CLE families.', '''
1961|W111 / W112 Coupé and Cabriolet|Mercedes-Benz W111|Coupe|A pillarless coupé or fabric-roof cabriolet with slender glazing.|A six-cylinder luxury chassis; later models add a V8.
1981|C126 SEC|Mercedes-Benz C126||A broad pillarless coupé with a long roof.|A W126-related luxury V8 platform.
1992|C140 S Coupé / CL|Mercedes-Benz CL-Class (C140)||A substantial two-door body with a distinctive rear window line.|A W140-related luxury platform.
1999|C215 CL|Mercedes-Benz CL-Class (C215)||A lower, flowing body with paired front lamps.|A new luxury-coupé structure with active-body-control systems.
2006|C216 CL|Mercedes-Benz CL-Class (C216)||A pronounced rear haunch and more sculpted flanks.|A large luxury-coupé platform.
2014|C217 S Coupé|Mercedes-Benz S-Class (C217)||A flowing roof and a strong rear shoulder.|A W222-related two-door platform.
2015|A217 S Cabriolet|Mercedes-Benz S-Class (C217)|Cabriolet|A folding fabric roof opens the large two-door body.|A reinforced open version of the luxury coupé.
''')
add('mercedes','600','600 / W100','Luxury limousine','The 600 was a separate flagship limousine and grand-touring saloon programme. Standard-wheelbase, Pullman and landaulet bodies share its V8 and hydraulic systems.', '''
1963|600 / W100|Mercedes-Benz 600|600|A formal upright saloon body.|A large V8 and extensive hydraulic auxiliary systems.
1964|Pullman / Landaulet|Mercedes-Benz 600|Pullman|An extended passenger compartment; landaulets open the rear roof.|Long-wheelbase developments of the flagship chassis.
''')
add('mercedes','slc-c107','SLC / C107','Grand tourer','The fixed-roof companion to the R107 SL uses a longer wheelbase and rear seats. It is unrelated to the much later SLK-derived SLC roadster name.', '''
1971|C107 SLC|Mercedes-Benz R107 and C107|C107|A fixed pillarless roof, rear seats and louvred rear-quarter trim.|A longer-wheelbase development of the R107 platform.
''')
add('mercedes','g-class','G-Class','Off-road vehicle','The G-Class keeps a recognisable upright body while its chassis, cabin and drivetrains change substantially. The electric G and six-wheel AMG derivative are distinct branches within the family.', '''
1979|W460 / W461|Mercedes-Benz G-Class|W460|A square body with exposed hinges and flat glazing.|A body-on-frame four-wheel-drive platform.
1990|W463|Mercedes-Benz G-Class|W463|A more luxurious cabin within the upright exterior.|A developed permanent-four-wheel-drive road model.
2013|G63 AMG 6×6|Mercedes-Benz G63 AMG 6×6||A six-wheel chassis and an open rear load bed.|A limited-production road-going three-axle derivative.
2018|Second-generation W463|Mercedes-Benz G-Class|2018|A wider body retains the original square outline.|A new chassis with independent front suspension.
2024|W465 / electric G580|Mercedes-Benz G-Class|2024|Revised details; electric versions retain the upright body.|Updated combustion models and a four-motor electric derivative.
''')
add('mercedes','c-class','190 / C-Class','Compact executive car','The compact Mercedes saloon line starts with the W201 190 and adopts the C-Class name in 1993. Later estates, coupés and cabriolets belong to the corresponding chassis generation.', '''
1982|190 / W201|Mercedes-Benz W201||A compact three-box body with an upright rear screen.|A rear-wheel-drive compact platform with multi-link rear suspension.
1993|W202|Mercedes-Benz C-Class (W202)||A softer, more rounded compact saloon body.|The first C-Class-badged generation; estate body joins later.
2000|W203|Mercedes-Benz C-Class (W203)||Curving combined headlamps and a rounded profile.|A new compact executive platform.
2007|W204|Mercedes-Benz C-Class (W204)||Sharper edges and a more upright grille.|A new saloon/estate platform with a later coupé derivative.
2014|W205|Mercedes-Benz C-Class (W205)||A flowing body and lower-looking roof.|A lighter platform with saloon, estate, coupé and cabriolet forms.
2021|W206|Mercedes-Benz C-Class (W206)||Slim lamps and a portrait-screen cabin.|A new electrified four-cylinder platform.
2026|Electric C-Class|Mercedes-Benz C-Class Electric||A dedicated electric-car body and cabin.|A separate battery-electric platform within the C-Class range.
''')
add('mercedes','slk','SLK / SLC','Roadster','The compact folding-hardtop roadster evolves through R170, R171 and R172 generations. The final SLC name is a rename and facelift of the R172, not a new chassis.', '''
1996|R170 SLK|Mercedes-Benz SLK-Class (R170)||A compact roadster with a folding metal roof.|A front-engine rear-wheel-drive compact chassis.
2004|R171 SLK|Mercedes-Benz SLK-Class (R171)||A pointed central nose and more sculpted body.|A new folding-hardtop roadster platform.
2011|R172 SLK|Mercedes-Benz SLK-Class (R172)||A broad upright grille and a squared-off nose.|A third-generation compact roadster.
2016|R172 SLC|Mercedes-Benz SLC-Class|SLC|Revised lamps and grille within the same roof/body form.|A renamed and updated R172; not a new generation.
''')
add('mercedes','a-class','A-Class','Compact car','The A-Class changes from a tall sandwich-floor mini-MPV into a conventional low hatchback. A saloon body joins the later range.', '''
1997|W168|Mercedes-Benz A-Class (W168)||A short, tall body with a steep nose.|A front-drive sandwich-floor platform.
2004|W169|Mercedes-Benz A-Class (W169)||A larger tall hatchback, offered with three or five doors.|A developed sandwich-floor platform.
2012|W176|Mercedes-Benz A-Class (W176)||A much lower conventional hatchback body.|A new front-drive compact platform.
2018|W177 / V177|Mercedes-Benz A-Class (W177)||A cleaner low hatchback and a new saloon body.|A new compact platform with a screen-led cabin.
''')
add('mercedes','clk','CLK','Coupé and cabriolet','The CLK pairs mid-size coupé/cabriolet styling with compact-platform components. It is separate from the homologation CLK GTR and the later large CL luxury coupés.', '''
1997|C208 / A208|Mercedes-Benz CLK-Class (C208)||A pillarless-looking coupé and fabric-roof cabriolet with oval lamps.|A compact-platform-based touring car.
2002|C209 / A209|Mercedes-Benz CLK-Class (C209)||A lower roof arc and more flowing two-door surfaces.|A new compact-derived two-door platform.
''')
add('mercedes','clk-gtr','CLK GTR Straßenversion','Homologation road car','A mid-engined GT1 homologation road car that shares a name and lamp references with the CLK. The racing CLK GTR, CLK LM and CLR are outside this production-road entry.', '''
1997|CLK GTR coupé|Mercedes-Benz CLK GTR|Stra|A long low body, roof intake and a large fixed wing.|A mid-mounted V12 in a homologation road chassis.
2002|CLK GTR Roadster|Mercedes-Benz CLK GTR|Roadster|An open cockpit and revised rear engine intake treatment.|A small road-going open-body derivative.
''')
add('mercedes','gle','M-Class / GLE','SUV','Mercedes-Benz’s medium-to-large SUV family begins as the M-Class and adopts the GLE name. Coupé-roof bodies join from the third platform generation.', '''
1997|W163 M-Class|Mercedes-Benz M-Class (W163)||An upright five-door SUV body.|A body-on-frame platform with four-wheel drive.
2005|W164 M-Class|Mercedes-Benz M-Class (W164)||A more integrated, rounded SUV body.|A unitary-body luxury SUV platform.
2011|W166 M-Class / GLE|Mercedes-Benz M-Class (W166)||A more sculpted SUV body, later renamed GLE.|A developed luxury SUV platform.
2015|C292 GLE Coupé|Mercedes-Benz GLE-Class (C292)||A sloping roof and high rear deck.|A coupé-roof body on the W166-related platform.
2018|W167 / C167 GLE|Mercedes-Benz GLE-Class (W167)||Revised SUV and coupé-roof bodies with a larger cabin.|A new luxury SUV platform with electrified derivatives.
''')
add('mercedes','slr','SLR McLaren','Super grand tourer','The Mercedes-McLaren collaboration uses a front-mid-mounted supercharged V8 and carbon structure. Coupé, Roadster and screenless Stirling Moss bodies are distinct road-going forms.', '''
2003|SLR McLaren coupé|Mercedes-Benz SLR McLaren|Coupe|A very long nose, side exhausts and upward-opening doors.|A carbon structure and supercharged V8.
2007|SLR Roadster|Mercedes-Benz SLR McLaren|Roadster|A folding fabric roof within the long-bonnet body.|A reinforced open-body carbon structure.
2009|Stirling Moss|Mercedes-Benz SLR McLaren|Moss|No conventional windscreen or roof; twin seat fairings.|A limited road-going open derivative of the SLR.
''')
add('mercedes','cls','CLS','Four-door coupé','The CLS combines four doors with a low arcing roof. Its second-generation Shooting Brake extends that roof into a low estate body.', '''
2004|C219|Mercedes-Benz CLS-Class (C219)||A low arcing roof and narrow side glass.|An executive-car platform with a four-door coupé body.
2010|C218|Mercedes-Benz CLS-Class (C218)||More sculpted sides and a more upright grille.|A second-generation executive-based platform.
2012|X218 Shooting Brake|Mercedes-Benz CLS-Class (C218)|Shooting|A long low estate roof and large rear opening.|An estate-body companion to the four-door coupé.
2018|C257|Mercedes-Benz CLS-Class (C257)||Cleaner sides and sharply tapered lighting.|A third-generation executive-car platform.
''')
add('mercedes','b-class','B-Class','Compact MPV','A tall compact passenger car that prioritises cabin space over a low roof. Electric B-Class versions remain within their corresponding body generation.', '''
2005|W245|Mercedes-Benz B-Class (W245)||A tall five-door body and steeply angled bonnet.|A front-drive sandwich-floor platform.
2011|W246|Mercedes-Benz B-Class (W246)||A lower-looking five-door body with a long glasshouse.|A new compact MPV platform, including an electric derivative.
2018|W247|Mercedes-Benz B-Class (W247)||Smoother sides and a taller cabin than the related A-Class.|A new front-drive compact platform.
''')
add('mercedes','r-class','R-Class','Luxury MPV','The R-Class combines a long passenger cabin with a low SUV/estate-like profile. Standard and long wheelbases share the same principal body design.', '''
2005|W251|Mercedes-Benz R-Class||A long roof, three seating rows and a low crossover-like stance.|A longitudinal-engine luxury people-carrier platform.
2010|W251 restyle|Mercedes-Benz R-Class|2010|A squarer grille and revised front lighting.|The same long-cabin platform with revised body details.
''')
add('mercedes','gls','GL / GLS','Large SUV','The three-row GL family is renamed GLS during its second generation. Mercedes-Maybach versions use the same main platform with a different cabin and exterior treatment.', '''
2006|X164 GL|Mercedes-Benz GL-Class (X164)||A large upright three-row SUV body.|A luxury SUV platform with four-wheel drive.
2012|X166 GL / GLS|Mercedes-Benz GL-Class (X166)||A more sculpted body, later renamed GLS.|A developed three-row SUV platform.
2019|X167 GLS / Mercedes-Maybach GLS|Mercedes-Benz GLS (X167)||A broader body with a larger grille and new rear lighting.|A new large SUV platform with conventional and Maybach luxury specifications.
''')
add('mercedes','glc','GLK / GLC','Compact SUV','The GLK’s upright angular body gives way to the softer GLC, followed by new SUV and coupé forms. The electric GLC is a separate-platform branch of the nameplate.', '''
2008|X204 GLK|Mercedes-Benz GLK-Class||An upright, strongly angular compact SUV body.|A longitudinal-engine compact SUV platform.
2015|X253 GLC|Mercedes-Benz GLC-Class (X253)||A rounded SUV body with a lower-looking roof.|A new compact luxury SUV platform.
2016|C253 GLC Coupé|Mercedes-Benz GLC-Class (X253)|Coupe|A sloping roof and higher rear deck.|A coupé-roof derivative of the SUV platform.
2022|X254 / C254 GLC|Mercedes-Benz GLC-Class (X254)||A cleaner body with slim lamps, offered as SUV and coupé.|A new combustion/plug-in-hybrid SUV platform.
2025|GLC with EQ Technology|Mercedes-Benz GLC Electric||A dedicated electric SUV body with a distinctive grille treatment.|A separate battery-electric platform.
''')
add('mercedes','sls','SLS AMG','Sports car','AMG’s own two-seat sports-car platform recalls the Gullwing with a long bonnet and roof-hinged doors. The Roadster and Black Series are distinct body/aero interpretations.', '''
2009|SLS AMG coupé / Electric Drive|Mercedes-Benz SLS AMG|Gullwing|A long bonnet, short cabin and roof-hinged doors.|An aluminium sports-car platform; Electric Drive is grouped in the same body.
2011|SLS Roadster|Mercedes-Benz SLS AMG|Roadster|A fabric roof and conventional doors.|A reinforced open version of the platform.
2013|SLS Black Series|Mercedes-Benz SLS AMG|Black|Wider arches, larger openings and a fixed rear wing.|A lighter road-legal performance derivative.
''')
add('mercedes','cla','CLA','Compact four-door coupé','The CLA applies a low four-door roof to the front-drive compact range. Shooting Brake bodies and the new electric-capable generation belong to the same named family.', '''
2013|C117|Mercedes-Benz CLA-Class (C117)||A low roof and a compact four-door coupé body.|A front-drive compact platform.
2015|X117 Shooting Brake|Mercedes-Benz CLA-Class (C117)|Shooting|A longer estate roof within the low compact body.|An estate-body derivative.
2019|C118 / X118|Mercedes-Benz CLA-Class (C118)||A wider, cleaner four-door and Shooting Brake body.|A second-generation compact platform.
2025|C178 / new CLA|Mercedes-Benz CLA-Class (C178)||A new body with distinctive lighting graphics and a screen-led cabin.|An electric-first architecture with electric and hybrid versions.
''')
add('mercedes','gla','GLA','Compact crossover','A compact crossover derived from Mercedes-Benz’s front-drive range. The second generation becomes taller and more SUV-like.', '''
2013|X156|Mercedes-Benz GLA-Class (X156)||A raised hatchback-like body with low side glass.|A front-drive compact crossover platform.
2019|H247|Mercedes-Benz GLA-Class (H247)||A taller roof and more upright rear body.|A second-generation compact crossover platform.
''')
add('mercedes','amg-gt','AMG GT','Sports car','AMG’s smaller sports-car line starts as a two-seat coupé and roadster. The later generation grows into a 2+2 body related to the modern SL platform.', '''
2014|C190 coupé|Mercedes-AMG GT|C190|A long bonnet, low cabin and large rear hatch.|A front-mid-mounted turbo V8 and rear transaxle.
2016|R190 Roadster|Mercedes-AMG GT|Roadster|A fabric folding roof opens the two-seat body.|An open version of the sports-car platform.
2020|Black Series|Mercedes-AMG GT|Black|A large rear wing, bonnet openings and wider aero surfaces.|A road-legal high-performance derivative.
2023|C192|Mercedes-AMG GT (C192)||A larger coupé with optional rear seats.|A new platform shared in broad architecture with the R232 SL.
''')
add('mercedes','x-class','X-Class','Personal-use pickup','Mercedes-Benz’s double-cab pickup is included alongside personal-use off-road vehicles. Heavy commercial trucks and vans are excluded from the passenger-vehicle catalog.', '''
2017|W470 X-Class|Mercedes-Benz X-Class||A four-door pickup body with a separate rear load bed.|A body-on-frame pickup platform with Mercedes-specific body and chassis development.
''')
add('mercedes','gt-four-door','AMG GT 4-Door','Performance liftback','The AMG GT 4-Door is a separate large passenger-car platform rather than a stretched two-door AMG GT. Combustion and later electric generations are distinguished within this nameplate.', '''
2018|X290|Mercedes-AMG GT 4-Door Coupé|X290|A large five-door fastback with a low roof.|A front-engine performance platform with later hybrid derivatives.
2026|Electric generation|Mercedes-AMG GT 4-Door Coupé|2026|A new electric fastback body and performance-focused cabin.|A dedicated AMG electric architecture.
''')
add('mercedes','eqc','EQC','Electric SUV','The EQC is an early dedicated Mercedes EQ-badged production SUV. Its body and cabin adapt the proportions of a conventional luxury crossover to electric power.', '''
2019|N293 EQC|Mercedes-Benz EQC||A rounded SUV body with a dark front panel.|A battery-electric luxury SUV platform.
''')
add('mercedes','glb','GLB','Compact SUV','A boxier compact SUV with optional third-row seating. The new electric-capable generation continues the square passenger-cabin format.', '''
2019|X247|Mercedes-Benz GLB|X247|An upright roof and squared-off rear body.|A front-drive compact SUV platform with optional seven-seat packaging.
2025|New electric GLB|Mercedes-Benz GLB|202[5-6]|A new square-bodied compact SUV with revised lighting.|An electric-first compact architecture.
''')
add('mercedes','eqa','EQA','Electric crossover','A battery-electric compact crossover with body proportions related to the GLA. Its closed front treatment and light bars distinguish the EQ version.', '''
2021|H243 EQA|Mercedes-Benz EQA||A closed dark grille panel and connected lighting.|A battery-electric derivative of the compact crossover platform.
''')
add('mercedes','eqb','EQB','Electric SUV','The EQB adapts the boxier GLB passenger-cabin format to battery-electric power. It is indexed separately as an EQ-badged production family.', '''
2021|X243 EQB|Mercedes-Benz EQB||A squared compact SUV body with closed-panel EQ styling.|A battery-electric compact SUV with optional third-row seating.
''')
add('mercedes','eqs','EQS / EQS SUV','Electric luxury car','The EQS name covers an aerodynamic luxury liftback and a taller SUV. They share the broad electric luxury programme but have visibly different roof and cabin proportions.', '''
2021|V297 EQS liftback|Mercedes-Benz EQS||A continuous bow-shaped roof and large rear hatch.|A dedicated luxury battery-electric platform.
2022|X296 EQS SUV|Mercedes-Benz EQS SUV||A much taller roof and three-row-capable SUV cabin.|An SUV body on the luxury electric architecture.
''')
add('mercedes','eqe','EQE / EQE SUV','Electric executive car','The EQE pairs an executive electric saloon with a taller SUV companion. Both use electric-specific proportions rather than simply replacing an engine in an E-Class body.', '''
2022|V295 EQE saloon|Mercedes-Benz EQE||A smooth bow-shaped saloon body with a short front end.|A dedicated battery-electric executive-car architecture.
2022|X294 EQE SUV|Mercedes-Benz EQE SUV||A taller cabin and upright rear opening.|An SUV body on the electric executive platform.
''')
add('mercedes','amg-one','AMG ONE','Hybrid supercar','A limited-production road car built around Formula One-derived hybrid technology. Its roof intake, central fin and active aero make the powertrain and cooling demands visible.', '''
2022|AMG ONE|Mercedes-AMG ONE||A roof intake, long rear fin and active aerodynamic surfaces.|A turbo V6 hybrid road powertrain derived from Formula One technology.
''')
add('mercedes','cle','CLE','Coupé and cabriolet','The CLE replaces the separate compact and executive coupé/cabriolet ranges with one named two-door family. Coupé and Cabriolet bodies share its basic layout.', '''
2023|C236 CLE Coupé|Mercedes-Benz CLE||A long two-door body with a low roof and frameless side glass.|A longitudinal-engine touring platform.
2024|A236 CLE Cabriolet|Mercedes-Benz CLE|Cabriolet|A folding fabric roof replaces the fixed coupé roof.|A reinforced open-body companion.
''')
# Audit adjustments: near-identical early chassis revisions remain in one body chapter.
mercedes=CATALOG['mercedes']
carry=next(c for c in mercedes if c['id']=='630')
carry['name']='400 / 630 / K'
carry['story']='The early supercharged six-cylinder touring line spans the pre-merger 400 and its Mercedes-Benz 630/K continuation. Coachbuilt bodies vary within the family; the 1926 merger changes the marque rather than creating an entirely new body.'
carry['variants'][0]['name']='400 / 630 / K'
carry['variants'][0]['wiki']='Mercedes 24/100/140 PS'
mercedes[:]=[c for c in mercedes if c['id']!='400']
c=next(c for c in mercedes if c['id']=='300-350')
c['variants']=c['variants'][:1];c['variants'][0]['name']='300 / 350 / W03-W04-W05';c['variants'][0]['engineering']='A front six-cylinder touring chassis, developed through W03, W04 and W05 revisions.'
c=next(c for c in mercedes if c['id']=='mannheim');c['variants'][1]['wiki']='Mercedes-Benz W10';c['variants'][1]['match']='380';c['variants'][1]['engineering']='An eight-cylinder development with revised independent suspension.'
c=next(c for c in mercedes if c['id']=='rear-engine')
for v in c['variants'][1:]:v['wiki']='Mercedes-Benz 130';v['match']='150' if v['year']==1935 else '170.H'
c=next(c for c in mercedes if c['id']=='s-series');c['name']='S / SS / SSK';c['variants']=c['variants'][:2]
add('mercedes','clc','C-Class SportCoupé / CLC','Compact coupé','The three-door SportCoupé is a separate hatchback body within the compact Mercedes range. A substantial facelift later adopts the CLC name.', '''
2000|CL203 SportCoupé|Mercedes-Benz C-Class (W203)|Sportcoupe|A short three-door body with a large rear hatch.|A compact rear-wheel-drive platform related to the W203 saloon.
2008|CLC|Mercedes-Benz CLC-Class||A revised nose and rear treatment within the three-door body.|A restyled continuation of the CL203 architecture.
''')
# Redirect-aware model histories and chassis matching for multi-generation articles.
for car in CATALOG['mercedes']:
 for v in car['variants']:
  aliases={'Mercedes-Benz 170 V':'Mercedes-Benz W136','Mercedes-Benz 170 S':'Mercedes-Benz W136','Mercedes-Maybach S-Class':'Mercedes-Benz W222','Mercedes-Maybach SL-Class':'Mercedes-AMG SL (R232)','Mercedes-Benz CL-Class (C140)':'Mercedes-Benz S-Class (C140)','Mercedes-Benz G63 AMG 6×6':'Mercedes-Benz G-Class','Mercedes-Benz M-Class (W166)':'Mercedes-Benz GLE-Class','Mercedes-Benz GLE-Class (W167)':'Mercedes-Benz GLE-Class','Mercedes-Benz CLC-Class':'Mercedes-Benz C-Class (W203)'}
  v['wiki']=aliases.get(v['wiki'],v['wiki'])
  if not v['match']:
   codes=__import__('re').findall(r'\b[WRCAXVH]\d{3}\b',v['name'])
   if codes:v['match']=codes[0]
  if 'Maybach' in v['name']:v['match']='Maybach'
  if '6×6' in v['name']:v['match']='6x6|6×6|6by6'
  if v['name']=='CLC':v['match']='CLC'
for car in CATALOG['mercedes']:
 for v in car['variants']:
  if v['wiki']=='Mercedes-Benz CLA-Class (C178)':v['wiki']='Mercedes-Benz CLA-Class'
  if v['wiki']=='Mercedes-Benz GLA-Class (H247)':v['wiki']='Mercedes-Benz GLA-Class'
  if v['wiki']=='Mercedes-Benz S-Class (C140)':v['wiki']='Mercedes-Benz W140';v['match']='C140|coupe|SEC|CL.600'
  if v['name']=='C126 SEC':v['match']='C126|SEC'
# Small road-going series appear separately from one-off commissioned bodies.
add('ferrari','f60-america','F60 America','Limited-production roadster','A ten-car open series marking Ferrari’s American-market anniversary. Its open body and twin rear fairings distinguish it from the related F12berlinetta.', '''
2014|F60 America|Ferrari F60 America||An open roof, twin rear fairings and a redesigned front body.|A limited road-going front-V12 series related to the F12.
''')
add('ferrari','sergio','Sergio','Limited-production roadster','A six-car road-going series developed from Pininfarina’s Sergio concept. The production car has a conventional windscreen and must be distinguished from the earlier screenless show car.', '''
2015|Production Sergio|Pininfarina Sergio|2015|A short open body, a conventional windscreen and a strong contrasting side graphic.|A limited road-going V8 series based on the 458 architecture.
''')
add('ferrari','j50','J50','Limited-production roadster','A ten-car road series created for Ferrari’s anniversary in Japan. Its targa-style roof and redesigned body distinguish it from the related 488 Spider.', '''
2016|J50|Ferrari J50||A low windscreen, targa roof and a dark horizontal nose treatment.|A limited turbo-V8 road series based on the 488 platform.
''')
for car in CATALOG['porsche']:
 if car['id']=='911':
  extra=[dict(year=1965,name='Classic Targa',wiki='Porsche 911 (classic)',match='Targa',shape='A fixed roof hoop and removable centre roof panel.',engineering='An open-roof version of the early rear-engined 911.',kind='Body variant'),dict(year=1974,name='930 Turbo',wiki='Porsche 930',match='',shape='Wide rear arches and a prominent rear spoiler.',engineering='A turbocharged air-cooled rear-engine road car.',kind='Body / powertrain variant'),dict(year=1982,name='G-series Cabriolet',wiki='Porsche 911 (classic)',match='Cabriolet',shape='A fully folding fabric roof replaces the fixed coupé roof.',engineering='The G-series rear-engine platform in an open body.',kind='Body variant'),dict(year=2014,name='991 Targa',wiki='Porsche 991',match='Targa',shape='A fixed-looking hoop with a moving rear roof and glass assembly.',engineering='A powered roof system within the 991 platform.',kind='Body variant'),dict(year=2022,name='992 GT3 RS',wiki='Porsche 992',match='GT3.RS',shape='A large swan-neck rear wing, bonnet outlets and highly open front aero.',engineering='A road-legal, naturally aspirated track-focused 911 derivative.',kind='Road-legal performance variant'),dict(year=2022,name='992 Dakar',wiki='Porsche 992',match='Dakar',shape='Raised suspension, arch protection and an off-road stance.',engineering='A limited all-wheel-drive, all-surface road car.',kind='Body / chassis variant')]
  car['variants']=sorted(car['variants']+extra,key=lambda v:v['year'])
# Near-identical engine developments share a body chapter; retain the names.
for car in CATALOG['mercedes']:
 if car['id']=='nurburg':
  car['variants']=car['variants'][:1];car['variants'][0]['name']='Nürburg 460 / 500';car['variants'][0]['match']='';car['variants'][0]['engineering']='A front straight-eight chassis; the 500 enlarges the engine within the same body lineage.'
 if car['id']=='mannheim':
  car['variants']=car['variants'][:1];car['variants'][0]['name']='Mannheim 350 / 370 / 380; 380 S';car['variants'][0]['engineering']='Six-cylinder Mannheim touring chassis; the shorter 380 S / W19 adds a straight-eight. The photograph represents the shared Mannheim family, not a separate W19 body comparison.'
 if car['id']=='300s':
  car['variants']=car['variants'][:1];car['variants'][0]['name']='300 S / Sc / W188';car['variants'][0]['engineering']='A front six-cylinder luxury chassis; the later Sc adds fuel injection within the same coachbuilt body family.'
for car in CATALOG['ferrari']:
 if car['id']=='275':car['variants'].append(dict(year=1967,name='275 GTB/4 NART Spyder',wiki='Ferrari 275',match='NART',shape='A fully open two-seat body replaces the closed berlinetta roof.',engineering='A ten-car open-body series on the four-cam 275 platform.',kind='Limited-production body variant'))
 if car['id']=='250':
  car['variants'][1]['match']='Europa GT'
 if car['id']=='mondial':car['variants'][1]['match']='3.2.Cabriolet'
for car in CATALOG['porsche']:
 if car['id']=='911':car['variants'][2]['name']='G series'

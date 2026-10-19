"""Maintained research catalog. Run to regenerate ../data.json before fetching media."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
 'influence': ['Autocar', 'The world’s most influential cars', 'https://www.autocar.co.uk/car-news/slideshow/world%E2%80%99s-most-influential-cars'],
 'sixties': ['Car and Driver', 'The Greatest Cars of All Time: The Sixties', 'https://www.caranddriver.com/features/a32964167/the-greatest-cars-of-all-time-the-sixties/'],
 'italian': ['Top Gear', 'The 50 greatest Italian cars of all time', 'https://www.topgear.com/car-news/list/these-are-50-greatest-italian-cars-all-time'],
 'french': ['Top Gear', 'The 50 greatest French cars of all time', 'https://www.topgear.com/car-news/list/50-greatest-french-cars-all-time'],
 'american': ['Top Gear', 'The 50 greatest American cars ever made', 'https://www.topgear.com/car-news/usa/these-are-50-greatest-american-cars-ever-made'],
 'patent': ['Top Gear', 'Benz Patent Motorwagen review', 'https://www.topgear.com/car-reviews/mercedes-benz/patent-motorwagen'],
 'sl': ['Top Gear', 'Every generation of the Mercedes SL', 'https://www.topgear.com/car-news/retro/heres-every-generation-mercedes-sl'],
 'sl-icon': ['Top Gear', 'Hammond’s icons: 300SL Gullwing', 'https://www.topgear.com/car-news/richard-hammond/hammonds-icons-mercedes-benz-300sl-gullwing'],
 'ds': ['Top Gear', 'Citroën DS review', 'https://www.topgear.com/car-reviews/citroen/ds'],
 'sm': ['Top Gear', 'Citroën SM review', 'https://www.topgear.com/car-reviews/citroen/sm'],
 'beetle': ['Top Gear', 'Gallery: bye bye, Volkswagen Beetle', 'https://www.topgear.com/car-news/classic/gallery-bye-bye-volkswagen-beetle'],
 '911': ['Top Gear', 'Every single generation of Porsche 911', 'https://www.topgear.com/car-news/heres-every-single-generation-porsche-911'],
 'mustang': ['Top Gear', 'A brief history of the Ford Mustang', 'https://www.topgear.com/car-news/usa/heres-a-brief-history-ford-mustang'],
 'golf': ['Top Gear', 'Volkswagen Golf GTI Mk1 review', 'https://www.topgear.com/car-reviews/volkswagen/golf-gti-mk1'],
 'golf-history': ['Top Gear', 'The Golf turns 50: which is the best generation?', 'https://www.topgear.com/car-news/retro/volkswagen-golf-turns-50-which-best-generation'],
 'f40': ['Car and Driver', 'Tested: 1991 Ferrari F40', 'https://www.caranddriver.com/reviews/a32983963/tested-1991-ferrari-f40/'],
 'mx5': ['Top Gear', 'Mazda MX-5 review', 'https://www.topgear.com/car-reviews/mazda/mx-5'],
 'f1': ['Top Gear', 'Greatest cars: hypercars', 'https://www.topgear.com/car-news/supercars/top-gear-mags-greatest-cars-hypercars'],
 'f1-race': ['Top Gear', 'Coolest racing cars: McLaren F1 GTR', 'https://www.topgear.com/car-news/motorsport/top-gears-coolest-racing-cars-mclaren-f1-gtr'],
 'tt': ['Top Gear', 'Progress Report: MkIII vs MkI Audi TT', 'https://www.topgear.com/car-news/retro/progress-report-2024-audi-tt-mkiii-vs-1999-audi-tt-mki'],
 'tt-review': ['Top Gear', 'Audi TT review', 'https://www.topgear.com/car-reviews/audi/tt-coupe'],
 'prius': ['Top Gear', 'Toyota Prius review', 'https://www.topgear.com/car-reviews/toyota/prius'],
 'i3': ['Top Gear', 'BMW i3 review', 'https://www.topgear.com/car-reviews/bmw/i3'],
 'i3-icon': ['Top Gear', 'Celebrating two gamechanging icons: i3 and A2', 'https://www.topgear.com/car-news/best-2022/celebrating-two-gamechanging-icons-bmw-i3-and-audi-a2'],
 'ioniq': ['Top Gear', 'Hyundai Ioniq 5 review', 'https://www.topgear.com/car-reviews/hyundai/ioniq-5'],
 'retro': ['Top Gear', '30 of the finest retro car designs', 'https://www.topgear.com/car-news/retro/30-finest-retro-car-designs'],
 'cyber': ['Top Gear', 'Tesla Cybertruck review', 'https://www.topgear.com/car-reviews/tesla/cybertruck'],
 'cyber-design': ['Top Gear', 'Why we still like the controversial Cybertruck', 'https://www.topgear.com/car-news/best-2023/opinion-yes-tesla-cybertruck-isnt-everyone-we-still-it'],
 'etype': ['Top Gear', 'Jaguar’s 60th anniversary E-Types', 'https://www.topgear.com/car-news/retro/jaguar-restoring-12-e-types-its-60th-anniversary'],
 'm1': ['Top Gear South Africa', 'The tragic hero arriving too late', 'https://topgear.co.za/retros/the-tragic-hero-arriving-too-late/'],
 'japanese': ['Top Gear', 'The 50 best Japanese cars of all time', 'https://www.topgear.com/car-news/list/50-best-japanese-cars-all-time'],
 'italdesign': ['Top Gear', 'Inside Italdesign’s incredible collection', 'https://www.topgear.com/car-news/best-2018/take-look-italdesigns-incredible-collection'],
 'stratos': ['Hagerty', 'Data Dive: Lancia Stratos HF Stradale', 'https://www.hagerty.co.uk/articles/data-dive-lancia-stratos-hf-stradale/'],
}
cars = []
def car(id, brand, name, year, country, designer, title, story, design, industry, sources, evidence, video, variants, excluded):
    cars.append(dict(id=id,brand=brand,name=name,year=year,country=country,designer=designer,title=title,story=story,
        design=design,industry=industry,sources=sources,evidence=evidence,video=video,variants=variants,excluded=excluded))
def gen(year, name, wiki, shape, engineering, match='', reject='', kind='Production'):
    return dict(year=year,name=name,wiki=wiki,shape=shape,engineering=engineering,match=match,reject=reject,kind=kind)
def yt(id, title, channel='Top Gear', note=''):
    return dict(id=id,title=title,channel=channel,note=note,url='https://www.youtube.com/watch?v='+id)
def episode(url, title, series, number):
    return dict(url=url,title=title,channel='Top Gear',episode=f'Series {series} · Episode {number}',note='Episode reference; no verified official YouTube upload attached.')

car('patent','Mercedes-Benz','Benz Patent-Motorwagen',1886,'Germany','Carl Benz','A vehicle, designed around an engine.',
 'The car begins as a purpose-built machine rather than a carriage conversion. Three wheels, an exposed engine and tiller steering make its unfamiliar layout visible at a glance.',
 30,30,['patent'],'Top Gear treats the Patent-Motorwagen as the starting point for the production automobile.',
 yt('fkwGJzU5B-I','Jeremy and James find the first car','Top Gear Classic','Historical driving feature; also includes the Model T.'),
 [gen(1886,'Patent-Motorwagen No. 1','Benz Patent-Motorwagen','Three wheels; tubular frame; no enclosed body.','Rear-mounted single-cylinder engine and belt drive.')],
 'Later prototypes and replicas are not separate generations here. The photographs identify surviving examples or replicas in their original captions. Benz predates the 1926 Mercedes-Benz merger.')
car('model-t','Ford','Model T',1908,'United States','Henry Ford & engineering team','The industrial revolution gets wheels.',
 'Affordability and repeatable manufacture turn the car into an everyday product. Its high, practical body belongs to an age when roads and ownership were both still being invented.',
 0,30,['influence'],'Autocar selects the Model T for its transformation of mass production, rather than radical styling.',
 yt('fkwGJzU5B-I','Jeremy and James find the first car','Top Gear Classic','Model T driving segment begins around 05:08.'),
 [gen(1908,'Early touring body','Ford Model T','Upright body and exposed brass-era fittings.','Simple construction built for affordability.',r'1908|1909|1910|1911|1912|1913|1914|1915',r'engine|tractor|snow|truck'),gen(1926,'Improved Model T','Ford Model T','Lower bonnet line and more integrated bodywork.','The same basic model, approaching the end of its long production run.',r'1926|1927',r'truck|tractor|engine')],
 'Numerous body suppliers and annual mechanical revisions are condensed into the two visibly different periods.')
car('airflow','Chrysler','Airflow',1934,'United States','Carl Breer & Chrysler team','The wind begins to draw the car.',
 'A rounded nose and integrated volume challenge the upright automobile. The Airflow’s commercial reception is a reminder that a new visual language can arrive before its audience.',
 60,30,['influence'],'Autocar explicitly credits the Airflow’s streamlined form with influencing later car design.',
 yt('C-j5fBCtaB8','Early car aerodynamics: 1934 Chrysler Airflow','Jay Leno’s Garage'),
 [gen(1934,'Original Airflow','Chrysler Airflow','Waterfall grille and a continuous, rounded body.','Wind-tunnel-led packaging moves passengers within the wheelbase.',r'1934',r'DeSoto|toy|engine'),gen(1936,'Revised Airflow','Chrysler Airflow','A more conventional projecting grille softens the original face.','A visual retreat within the same engineering concept.',r'1936|1937',r'DeSoto|toy')],
 'Wheelbase and engine derivatives are omitted; DeSoto’s related Airflow is a separate model.')
car('beetle','Volkswagen','Beetle',1938,'Germany','Ferdinand Porsche’s design office','A silhouette that outlives its era.',
 'The rounded rear-engined Volkswagen becomes a global postwar fixture. Its origins in Nazi Germany are part of this history; later cultural reinvention does not erase them.',
 30,30,['beetle','retro'],'Top Gear documents the Beetle’s three lives and its enduring visual identity.',
 yt('7cPkvQ5KI88','1955 Volkswagen Beetle','Jay Leno’s Garage','A stock original Beetle, rather than a modified example.'),
 [gen(1938,'Type 1','Volkswagen Beetle','Separate wings, circular lamps and a domed rear.','Air-cooled engine behind the rear axle.',r'196[0-9]|195[0-9]|1938',r'new beetle|201[0-9]|199[89]'),gen(1998,'New Beetle','Volkswagen New Beetle','Three exaggerated arcs turn the old shape into retro design.','Front engine and front-wheel drive replace the original layout.'),gen(2011,'Beetle A5','Volkswagen Beetle (A5)','Lower roof and flatter, broader proportions.','A second modern reinterpretation, rather than a Type 1 continuation.')],
 'The 1302/1303 and small window changes are omitted to keep the visual story concise. Dates refer to public introduction, not every market’s model year.')
car('300sl','Mercedes-Benz','300 SL',1954,'Germany','Friedrich Geiger & Mercedes-Benz team','Engineering opens a new kind of door.',
 'Gullwing doors turn a structural constraint into an unmistakable identity. A racing-derived frame and low roof give the road car a visual drama that still defines the marque’s sporting history.',
 60,30,['sl','sl-icon'],'Top Gear identifies the Gullwing as a supercar landmark and one of Mercedes’ defining designs.',
 episode('https://watch.plex.tv/show/top-gear/season/5/episode/5','James May celebrates 50 years of the 300 SL Gullwing',5,5),
 [gen(1954,'W198 Gullwing coupé','Mercedes-Benz 300 SL','Roof-hinged doors and long, low coupé proportions.','A tubular spaceframe makes conventional doors impractical.',r'gullwing|coup|195[456]',r'roadster|replica|engine'),gen(1957,'W198 Roadster','Mercedes-Benz 300 SL','An open roof and conventional doors change the entire profile.','A redesigned frame lowers the sills.',r'roadster',r'SLS|replica|engine')],
 'The later SL generations and SLS are successors, not variants of the W198 300 SL.')
car('ds','Citroën','DS',1955,'France','Flaminio Bertoni & André Lefèbvre','The future arrives in a family saloon.',
 'The DS unites a tapering body with self-levelling hydropneumatic suspension. Here, radical appearance and a radically different experience of travel belong to the same idea.',
 60,30,['ds','influence'],'Top Gear calls the DS a landmark of beauty and technology; Autocar also includes it among influential cars.',
 episode('https://tv.apple.com/us/episode/james-and-richard-go-camping-in-cabriolets/umc.cmc.wxsnfsa24qq3vh5edg715089','James May nominates the DS as his greatest car',2,8),
 [gen(1955,'DS 19 · original face','Citroën DS','Uncovered round lamps and a tapering, low-drag body.','Hydraulic suspension, steering and controls.',r'195[5-9]|196[0-6]|ID19B',r'break|safari|cabrio|engine'),gen(1960,'Décapotable','Citroën DS','Chapron’s open body removes the saloon’s roof arc.','A specialist convertible built around DS running gear.',r'cabrio|d.capot|convertible',r'SM'),gen(1967,'Restyled DS','Citroën DS','Four lamps behind glass give the nose a new expression.','Directional inner headlamps on appropriately equipped versions.',r'196[89]|197[0-5]',r'break|safari|cabrio|engine|production.chart')],
 'ID equipment levels, DS 20/21/23 engine changes and minor nose revisions are excluded. Not every market received covered directional lamps.')
car('mini','Mini / BMC','Mini',1959,'United Kingdom','Alec Issigonis','Small becomes a design philosophy.',
 'Wheels pushed to the corners and a transverse engine make room inside a tiny footprint. The original arrives as the Austin Seven and Morris Mini-Minor, long before MINI becomes a standalone modern marque.',
 60,30,['sixties','influence'],'Car and Driver and Autocar both nominate the Mini for its transformative packaging.',
 yt('FGr-I_hDSjA','1965 Morris Mini Minor','Jay Leno’s Garage'),
 [gen(1959,'BMC original','Mini','Upright glass, tiny overhangs and external seams.','Transverse front engine maximises passenger space.',r'1959|196[0-9]|Austin|Morris',r'200[0-9]|201[0-9]|Countryman'),gen(2001,'R50 / R53','Mini Hatch','A larger retro body preserves the face and contrasting roof.','BMW-era reinterpretation with modern crash protection.',r'R50|R53|200[1-6]',r'engine'),gen(2006,'R56','Mini Hatch','Taller front surfaces evolve the retro proportions.','A new generation beneath a deliberately familiar shape.',r'R56|200[7-9]|201[0-3]',r'engine'),gen(2013,'F56','Mini Hatch','A longer nose and larger lamps scale the theme up again.','More space and a broader modern platform.',r'F56|201[4-9]|202[0-2]',r'F55|Clubman|Countryman|engine'),gen(2023,'J01 electric Cooper','Mini Cooper (J01)','Simpler surfaces and triangular rear lamps reset the detailing.','A dedicated electric architecture; separate from the petrol F66.')],
 'Cooper engine trims, special editions and the visually close petrol F66 are omitted. The electric J01 is explicitly distinguished from the petrol lineage.')
car('etype','Jaguar','E-Type',1961,'United Kingdom','Malcolm Sayer','Aerodynamics becomes sculpture.',
 'A long bonnet and compact cabin bring racing-derived form to the road. The E-Type sits at the intersection of engineering, attainable performance and the car as a desirable object.',
 60,30,['etype','sixties'],'Car and Driver includes the E-Type in its greatest-cars selection; Top Gear highlights its lasting design reputation.',
 episode('https://www.topgear.com/videos/jeremy-clarkson/jeremy-drives-e-type-part-12-series-17-episode-1','Jeremy celebrates 50 years of the E-Type',17,1),
 [gen(1961,'Series 1','Jaguar E-Type','Glass-covered lights and a small oval intake.','Straight-six power in a racing-influenced structure.',r'Series.1|196[1-6]|1967',r'2\+2|engine|replica'),gen(1968,'Series 2','Jaguar E-Type','Exposed lamps, larger intake and lower rear lights.','Cooling and road-use requirements reshape the details.',r'Series.2|1969|1970',r'engine'),gen(1971,'Series 3','Jaguar E-Type','Flared arches and a longer, fuller body.','A V12 and longer wheelbase change the character.',r'Series.3|197[1-5]',r'engine')],
 'Series 1½, engine-capacity changes, restorations and modern restomods are omitted.')
car('911','Porsche','911',1963,'Germany','Ferdinand Alexander Porsche','Evolution becomes its own revolution.',
 'The descending roof and rear engine establish a shape Porsche keeps revisiting. Its story is a study in changing a car substantially while maintaining a recognisable visual thread.',
 30,30,['911'],'Top Gear’s generation history documents a persistent silhouette and successive engineering reinventions.',
 yt('8WMMjO6gafg','Top Gear decides the best Porsche 911 ever'),
 [gen(1963,'Original / F series','Porsche 911 (classic)','Slender pillars and a narrow, sloping body.','An air-cooled flat-six sits behind the rear axle.',r'196[3-9]|197[0-3]',r'turbo|engine'),gen(1973,'G series','Porsche 911 (classic)','Impact bumpers interrupt the original’s delicate surfaces.','Safety requirements bring conspicuous protective structures.',r'197[4-9]|198[0-8]|G.series',r'engine'),gen(1989,'964','Porsche 964','Integrated bumpers smooth the familiar outline.','All-wheel drive becomes available.'),gen(1993,'993','Porsche 993','Lower front wings and slanted lamps soften the face.','The last air-cooled generation.'),gen(1997,'996','Porsche 996','Shared oval lamp units break the round-headlight tradition.','Water cooling changes the engine architecture.'),gen(2004,'997','Porsche 997','Round lamps return above more defined front wings.','A more classic expression of the water-cooled car.'),gen(2011,'991','Porsche 991','A longer wheelbase and slimmer lamps stretch the proportions.','Electric power steering arrives.'),gen(2018,'992','Porsche 992','A full-width rear light bar and wider body.','Hybridisation later arrives within this generation.')],
 'Facelifts and most GT, Turbo and limited-run trims are omitted; the generation changes already show the main evolution. Years are introduction dates, which can precede model years.')
car('mustang','Ford','Mustang',1964,'United States','Gale Halderman & Ford design team','Desire becomes a mass-market product.',
 'A long bonnet, short deck and accessible price create the pony-car template. Over later generations the Mustang moves through downsizing, angular minimalism and explicit retro revival.',
 30,30,['sixties','mustang'],'Car and Driver selects the Mustang; Top Gear traces its market impact and changing body forms.',
 yt('O46E0gCF5os','Mustang GT500 road and track review','Top Gear','Richard Hammond tests a fifth-generation Shelby; not the 1964 original.'),
 [gen(1964,'First generation','Ford Mustang (first generation)','Long bonnet, short rear deck and sculpted sides.','Mass-market Ford components underpin a new image.'),gen(1973,'Mustang II · 1974 model','Ford Mustang (second generation)','A dramatically smaller body with more formal detailing.','Downsizing replaces the original architecture.'),gen(1978,'Fox · 1979 model','Ford Mustang (third generation)','A crisp wedge and hatchback roof replace the old curves.','A lighter, shared Fox platform.'),gen(1993,'SN95 · 1994 model','Ford Mustang (fourth generation)','Rounded surfaces restore references to the early car.','A substantially revised Fox-derived structure.'),gen(2004,'S197 · 2005 model','Ford Mustang (fifth generation)','A strong retro face returns to the 1960s vocabulary.','A new platform supports the revival.'),gen(2013,'S550 · 2015 model','Ford Mustang (sixth generation)','Lower, more global proportions update the retro theme.','Independent rear suspension becomes standard.'),gen(2022,'S650 · 2024 model','Ford Mustang (seventh generation)','Sharper front graphics; a screen-led cockpit.','An evolution of the S550 architecture.')],
 'Annual 1960s restyles, the 1999 New Edge facelift and Shelby derivatives are condensed. Mach-E is a separate model, not a Mustang coupé generation.')
car('miura','Lamborghini','Miura',1966,'Italy','Marcello Gandini / Bertone','The engine moves. The silhouette follows.',
 'The low, flowing Miura makes a mid-engined road car a glamorous cultural object. It is a decisive supercar landmark, although neither the first mid-engined road car nor a simple origin story.',
 60,30,['italian','sixties'],'Top Gear and Car and Driver independently nominate the Miura as a defining supercar.',
 yt('vSj7GFLDhew','Lamborghini Miura — the first modern supercar','Top Gear','The video title uses “first”; the historical claim is more nuanced.'),
 [gen(1966,'P400','Lamborghini Miura','Low bonnet, louvred tail and eyelash headlamp surrounds.','A transverse V12 sits behind the cabin.',r'P400|196[6-9]',r'SV|concept|engine|Jota'),gen(1971,'P400 SV','Lamborghini Miura','Broader rear arches and headlamps without the eyelashes.','Revised rear suspension and wider tyres.',r'SV|197[1-3]',r'Jota|replica')],
 'The visually close P400 S is omitted, as are one-offs, replicas and the 2006 concept.')
car('sm','Citroën','SM',1970,'France','Robert Opron','The grand tourer takes a different road.',
 'A glass-covered nose and tapering tail stretch Citroën’s experimental design into a grand tourer. The SM combines French hydraulic systems with a Maserati V6 rather than copying the conventional luxury coupé.',
 60,0,['sm'],'Top Gear’s retrospective places the SM within Citroën’s tradition of ambitious, unconventional cars.',
 yt('66NyE8DabIY','Citroën SM: would I buy one?','Harry’s Garage'),
 [gen(1970,'SM production coupé','Citroën SM','Glazed six-lamp nose, rear skirts and a sharply tapered body.','Maserati V6, hydropneumatic suspension and DIRAVI steering.',r'SM',r'Op.ra|Mylord|Pr.sident|engine|diagram')],
 'Engine revisions and market-specific exposed headlamps are omitted; coachbuilt four-door and convertible specials are not production generations.')
car('stratos','Lancia','Stratos',1973,'Italy','Marcello Gandini / Bertone','A rally car drawn from a wedge.',
 'A short wheelbase and wraparound windscreen give the Stratos a concentrated, almost helmet-like form. Purpose-built competition packaging creates a road car with an unusually specific silhouette.',
 60,30,['stratos','italian'],'Hagerty traces the design to Gandini’s wedge experiments; Top Gear nominates its rally significance.',
 yt('KG3Eqp6dfZo','The uncompromising legendary Lancia Stratos','Petrolicious','An owner-led driving film, rather than a comparative road test.'),
 [gen(1973,'HF Stradale','Lancia Stratos','Short wedge body and a curved visor-like windscreen.','Ferrari V6 mounted behind the seats.',r'Stradale|stradale|197[3-8]',r'Zero|rally|Alitalia|Group|engine'),gen(1974,'Group 4 rally form','Lancia Stratos','Wider arches, spoilers and rally equipment.','Competition development for the World Rally Championship.',r'rally|Alitalia|Group.4',r'Zero|replica')],
 'The 1970 Stratos Zero is a separate concept. The later New Stratos is not a generation of the original car. Rally form is labelled as competition, not a road trim.')
car('countach','Lamborghini','Countach',1974,'Italy','Marcello Gandini / Bertone','The supercar becomes an angular object.',
 'Scissor doors and the cab-forward wedge replace the Miura’s flowing curves. Later wings and widened arches show how the same radical foundation becomes a maximalist poster image.',
 60,30,['italian','retro'],'Top Gear singles out the Countach’s shape and its importance to Lamborghini’s identity.',
 yt('jLd4z4QKx6w','James May reviews the Countach','Top Gear Classic'),
 [gen(1974,'LP400','Lamborghini Countach','Clean wedge surfaces and narrow wheelarches.','A longitudinal V12 replaces the Miura’s transverse layout.',r'LP400|LP.400',r'400S|400.S|replica|engine'),gen(1978,'LP400 S','Lamborghini Countach','Bolt-on arches, deep front spoiler and wide wheels.','A wider stance changes the visual balance.',r'400.?S',r'replica'),gen(1988,'25th Anniversary','Lamborghini Countach','Straked intakes and heavier body additions.','Horacio Pagani’s restyling closes the original production story.',r'Anniversary|1989|1990',r'LPI|replica'),gen(2021,'LPI 800-4 revival','Lamborghini Countach LPI 800-4','The wedge returns on a larger, softer-edged body.','A separate modern hybrid model reuses the Countach name.')],
 'LP500 S and Quattrovalvole mechanical changes are condensed into the wide-body period. The LPI 800-4 is clearly a nameplate revival, not a continuation of the original chassis.')
car('golf','Volkswagen','Golf / GTI',1974,'Germany','Giorgetto Giugiaro / Italdesign','The rational hatch learns to entertain.',
 'The Golf exchanges the Beetle’s rear-engine curves for front-wheel-drive geometry. The GTI, introduced in 1976, makes this practical hatchback format a performance template.',
 30,30,['golf','golf-history','influence'],'Top Gear reviews the Mk1 as a landmark; Autocar selects the GTI for its industry influence.',
 yt('lmL_QbUwvsg','Mk8 Golf GTI review','Top Gear','Review of a later generation; the main timeline dates the Golf’s 1974 introduction.'),
 [gen(1974,'Mk1','Volkswagen Golf Mk1','Crisp, folded surfaces and slender pillars.','Front engine and front-wheel drive replace Beetle packaging.'),gen(1983,'Mk2','Volkswagen Golf Mk2','A larger body retains the upright, angular identity.','The hatchback grows without changing its basic recipe.'),gen(1991,'Mk3','Volkswagen Golf Mk3','Rounder corners and oval headlamps soften the geometry.','Greater emphasis on safety and refinement.'),gen(1997,'Mk4','Volkswagen Golf Mk4','Tight detailing and jewel-like lamps add a premium character.','A marked move toward perceived cabin quality.'),gen(2003,'Mk5','Volkswagen Golf Mk5','A taller, rounder body and split rear lamps.','Multi-link rear suspension supports more sophisticated dynamics.'),gen(2008,'Mk6','Volkswagen Golf Mk6','Slimmer lamps and a more horizontal face.','An extensive evolution of the Mk5 architecture.'),gen(2012,'Mk7','Volkswagen Golf Mk7','A lower-looking body and sharper creases.','The MQB platform brings a structural reset.'),gen(2019,'Mk8','Volkswagen Golf Mk8','Narrow lamps and a screen-centric interior.','Digital controls become a central design change.')],
 'GTI, R, diesel and estate trims are not separate timeline families. Small facelifts, including Mk8.5, are excluded.')
car('espace','Renault','Espace',1984,'France','Matra / Antoine Volanis lineage','The cabin becomes the whole idea.',
 'One continuous volume and flexible seating propose a new kind of European family car. The Espace’s later shift toward SUV form records the market’s changing idea of practicality.',
 60,30,['french'],'Top Gear includes the Espace among the greatest French cars and explicitly praises its revolutionary one-box design.',
 yt('lyNs0mx-tKU','Renault Espace (2023) review','AutoWeek','Dutch-language review of the latest SUV; no verified original-generation Top Gear review attached.'),
 [gen(1984,'Espace I','Renault Espace','A single wedge-like volume with a vast glasshouse.','Composite panels and movable seats.',r'first|198[4-9]|1990',r'F1|engine'),gen(1991,'Espace II','Renault Espace','Softer corners and smoother front surfaces.','Matra’s flexible cabin concept continues.',r'second|199[1-6]',r'F1|engine'),gen(1996,'Espace III','Renault Espace','A more rounded nose and flowing glass.','The Grand Espace extends the format.',r'third|199[7-9]|200[01]',r'F1|engine'),gen(2002,'Espace IV','Renault Espace','Sharper, architectural surfaces replace the curves.','Renault takes production in-house.',r'fourth|200[3-9]|201[0-4]',r'F1|engine'),gen(2014,'Espace V','Renault Espace','A raised stance and crossover proportions.','The original MPV idea starts moving toward SUV territory.',r'fifth|201[5-9]|202[0-2]',r'F1|engine'),gen(2023,'Espace VI','Renault Espace','A conventional SUV body ends the one-box silhouette.','The name continues on an Austral-related model.',r'sixth|202[3-6]',r'F1|engine')],
 'The Espace F1 concept and small facelifts are omitted. The V and VI demonstrate a change in vehicle type, not an unchanged MPV lineage.')
car('f40','Ferrari','F40',1987,'Italy','Pininfarina / Leonardo Fioravanti team','The racing machine stays visible.',
 'Vents, a transparent engine cover and a fixed rear wing leave the car’s purpose on display. The F40 makes exposed functional hardware part of a lasting supercar image.',
 30,30,['f40'],'Car and Driver’s period test connects the F40’s appearance directly to its racing-oriented construction.',
 yt('7mFleLfedrU','1980s supercar powertest: F40 and 959'),
 [gen(1987,'F40 road car','Ferrari F40','Perforated rear panel, exposed engine and integrated wing.','Twin-turbo V8 in a lightweight composite-bodied car.',r'F40',r'LM|GTE|Competizione|engine'),gen(1989,'F40 LM','Ferrari F40','A deeper splitter, larger wing and race-specific body openings.','Michelotto’s competition development.',r'LM|Competizione',r'GTE|engine')],
 'Regional bumpers and minor specification changes are omitted. The LM is a competition derivative; F50 and Enzo are separate cars.')
car('mx5','Mazda','MX-5',1989,'Japan','Mazda design teams / Tom Matano & colleagues','The lightweight roadster lives again.',
 'Compact proportions, modest power and an open roof revive the accessible two-seat sports car. Four generations show a clear shift from friendly simplicity to sharper, more expressive surfaces.',
 30,30,['mx5'],'Top Gear describes the first MX-5 as a modern classic that reinterpreted the lightweight British roadster.',
 yt('3Rs-cyKNvE8','Mazda MX-5 road test','Carbuyer','Review of the fourth-generation ND roadster.'),
 [gen(1989,'NA','Mazda MX-5 (NA)','Pop-up lamps and a simple, low oval body.','A light front-engine, rear-drive roadster.'),gen(1998,'NB','Mazda MX-5 (NB)','Fixed lamps replace the pop-ups; surfaces become fuller.','The original proportions continue with structural updates.'),gen(2005,'NC','Mazda MX-5 (NC)','Round arches and a broader, taller body.','A more substantial platform; a folding hardtop later joins.'),gen(2015,'ND','Mazda MX-5 (ND)','Narrow lamps and taut, sculpted body sides.','A deliberate return to compact dimensions.'),gen(2016,'ND RF','Mazda MX-5 (ND)','Flying buttresses and a retractable roof alter the side profile.','A powered roof trades some open-air exposure for a coupé-like silhouette.',r'RF',r'engine')],
 'Engine revisions, anniversary editions and the NC folding hardtop are condensed. The RF stays because its roof changes the silhouette.')
car('f1','McLaren','F1',1992,'United Kingdom','Gordon Murray & Peter Stevens','The driver becomes the centre.',
 'A central driving seat reorganises the cabin around the person in control. The F1 joins compact packaging, a carbon structure and a naturally aspirated V12 in a highly focused road car.',
 60,30,['f1','f1-race'],'Top Gear selects the F1 as a greatest-car benchmark and emphasises its unconventional three-seat packaging.',
 yt('AIqANh0vraU','McLaren F1, 911 GT1 and CLK GTR: road-car group test','Carfection','Henry Catchpole drives the F1 and explores its design and motorsport heritage.'),
 [gen(1992,'F1 road car','McLaren F1','A compact body wraps a central seat with two offset passengers.','Carbon-fibre monocoque and BMW V12.',r'F1',r'GTR|LM|GT |engine'),gen(1995,'F1 LM','McLaren F1','Fixed wing, deeper splitter and more cooling openings.','A road-going derivative inspired by the Le Mans winner.',r'F1.LM|F1 LM|_LM',r'GTR|engine'),gen(1997,'F1 GTR Longtail','McLaren F1 GTR','A much longer tail and stretched aero body.','A dedicated racing evolution, not a road-car generation.',r'1997|long.?tail',r'engine')],
 'The F1 GT homologation version is discussed with the longtail idea rather than given a near-duplicate gallery. P1 and W1 are successors, not F1 variants.')
car('prius','Toyota','Prius',1997,'Japan','Toyota design teams','Efficiency finds a recognisable shape.',
 'Hybrid propulsion moves into regular production, then gains a distinctive aerodynamic body. The fifth Prius later turns that functional identity into a low, deliberately desirable silhouette.',
 60,30,['influence','prius'],'Autocar selects its hybrid influence; Top Gear explicitly praises the radical visual transformation of the fifth generation. The design score applies to the family’s evolution, not the 1997 saloon alone.',
 yt('85qJ6j3ONUk','Toyota Prius review','Carwow','Review of the fifth generation.'),
 [gen(1997,'XW10','Toyota Prius (XW10)','A tall, compact three-box saloon.','A production hybrid system introduces the formula.'),gen(2003,'XW20','Toyota Prius (XW20)','A high tail and continuous roof arc create the familiar wedge.','More practical hatchback packaging.'),gen(2009,'XW30','Toyota Prius (XW30)','Sharper edges refine the wedge-shaped body.','A larger petrol engine accompanies hybrid-system changes.'),gen(2015,'XW50','Toyota Prius (XW50)','Split lamps and deeply cut surfaces make the design busier.','A new TNGA-based platform.'),gen(2022,'XW60','Toyota Prius (XW60)','Lower roof, steep windscreen and clean, thin lighting.','Hybrid and plug-in versions share the new body concept.')],
 'Prius c, Prius v and minor facelifts are separate or too similar. Plug-in versions are grouped with their corresponding generation.')
car('tt','Audi','TT',1998,'Germany','Freeman Thomas & Peter Schreyer’s team','A concept car escapes into production.',
 'Circles, arcs and carefully controlled surfaces turn the compact coupé into a design object. The first TT brings a remarkably intact show-car idea to the road.',
 60,0,['tt','tt-review'],'Top Gear identifies the original TT’s Bauhaus-inspired design as an unusually important part of its appeal.',
 yt('VU6uvU1Ebnc','Audi TT — a very fashionable car'),
 [gen(1998,'8N · first generation','Audi TT','Circular wheelarches and a near-symmetrical roof arc.','Golf-derived components support a distinctive body.',r'8N|199[89]|200[0-5]',r'8J|8S|engine'),gen(2006,'8J · second generation','Audi TT','A longer body and sharper lamps move beyond pure circles.','A mixed-material structure and broader stance.',r'8J|200[7-9]|201[0-3]',r'8N|8S|engine'),gen(2014,'8S · third generation','Audi TT','Angular lamps and a flatter grille sharpen the familiar roof.','Virtual Cockpit moves most instruments into the driver’s display.',r'8S|201[5-9]|202[0-3]',r'8N|8J|engine')],
 'Roadsters and RS engine derivatives are condensed into the generation galleries. The TT shown is the production car, not the 1995 concept.')
car('model-s','Tesla','Model S',2012,'United States','Franz von Holzhausen & Tesla team','The electric car becomes aspirational.',
 'Long-range electric power arrives in a conventional luxury-fastback body. A large central touchscreen makes software and the interface a visible part of automotive design.',
 30,30,['american'],'Top Gear selects the Model S for making electric cars impossible for the wider industry to ignore.',
 yt('34VZzBWBDN0','Model S Plaid: things I love and hate','Auto Focus','Marques Brownlee’s ownership review of the 2021-onward interior and powertrain.'),
 [gen(2012,'Original Model S','Tesla Model S','A black oval nose panel and upright central screen.','A floor-mounted battery enables a large cabin.',r'201[2-5]',r'engine'),gen(2016,'Facelift','Tesla Model S','The black nose panel disappears for a cleaner front.','The same model architecture continues.',r'201[6-9]|2020',r'Plaid|engine'),gen(2021,'Interior redesign / Plaid era','Tesla Model S','Landscape screen and a redesigned dashboard; a yoke is offered.','A major cabin revision; Plaid adds a third motor.',r'202[1-6]|Plaid|yoke',r'engine')],
 'Battery sizes, motor counts and small later exterior updates are grouped. Plaid is not presented as a second-generation Model S.')
car('i3','BMW','i3',2013,'Germany','Benoit Jacob & BMW i design','The electric car gets its own architecture.',
 'An upright cabin, rear-hinged back doors and contrasting body panels reject the conventional BMW saloon. Visible recycled and natural materials make the interior part of the experiment.',
 60,30,['i3','i3-icon'],'Top Gear calls the i3 a gamechanging icon and explicitly recognises its radical design and carbon construction.',
 yt('SyIIfefKr9w','BMW i3 review','Auto Express'),
 [gen(2013,'I01','BMW i3 (hatchback)','Tall glasshouse, interrupted beltline and rear-hinged doors.','A carbon passenger cell sits on an aluminium drive structure.',r'i3|I01',r'2026|Neue|engine')],
 'i3s, range-extender and battery upgrades retain essentially the same design. The unrelated later i3 saloon is not a generation of the I01 hatchback.')
car('ioniq5','Hyundai','Ioniq 5',2021,'South Korea','SangYup Lee’s Hyundai design team','Retro pixels meet electric proportions.',
 'Crisp facets and square lighting recall early hatchbacks, but an unusually long wheelbase changes the scale. The dedicated EV platform lets the cabin occupy more of the car’s footprint.',
 60,0,['ioniq','retro'],'Top Gear praises the Ioniq 5’s design and includes it among its finest retro designs.',
 yt('88IwkKQFPcE','Ioniq 5: dual-motor Tesla rival tested'),
 [gen(2021,'Ioniq 5','Hyundai Ioniq 5','Pixel lamps, diagonal side creases and a long wheelbase.','A dedicated electric platform allows a flat cabin floor.',r'202[1-3]|Ioniq.5',r'5.N|5N|2025|2026|engine'),gen(2023,'Ioniq 5 N','Hyundai Ioniq 5 N','Larger cooling openings, a rear wing and broader lower body.','A substantially reworked performance derivative.')],
 'N Line styling packages and the mild standard-car facelift are omitted. The N remains because both body treatment and driving systems change substantially.')
car('cybertruck','Tesla','Cybertruck',2023,'United States','Franz von Holzhausen & Tesla team','The wedge returns as a pickup.',
 'Flat stainless-steel panels and a triangular roofline challenge the visual rules of the pickup. Its place here records a radical design experiment, without assuming commercial success or lasting influence.',
 60,0,['cyber','cyber-design'],'Top Gear explicitly discusses the rejection of conventional pickup design. Long-term industry influence is not awarded.',
 yt('hcioIka_ByE','Living with the Cybertruck so you don’t have to','Auto Focus'),
 [gen(2023,'Production Cybertruck','Tesla Cybertruck','Flat stainless panels, peaked roof and a full-width light strip.','Steer-by-wire and rear-wheel steering change the controls.',r'202[3-6]',r'prototype|2019|2020|engine')],
 'The 2019 show vehicle is a prototype, not the production date. Foundation, AWD and Cyberbeast trims share the main design and are grouped.')

next(model for model in cars if model['id']=='beetle')['video']['related'] = {
    'title':'Also on Top Gear: 911 versus Beetle · Series 16, episode 1 (stunt)',
    'url':'https://www.topgear.com/videos/richard-hammond/porsche-911-turbo-vs-vw-beetle-part-12-series-16-episode-1'}
next(model for model in cars if model['id']=='f1')['video']['related'] = {
    'title':'Also watch Top Gear: Veyron versus F1 (performance comparison)',
    'url':'https://www.youtube.com/watch?v=RXqSedWSu2k'}
for model in cars:
    for variant in model['variants']:
        if variant['name'] in ['Group 4 rally form', 'F40 LM', 'F1 GTR Longtail']:
            variant['kind'] = 'Competition derivative'
        elif variant['name'] == 'LPI 800-4 revival':
            variant['kind'] = 'Separate nameplate revival'

honors = [
 ('Chevrolet Corvette',1953,'Chevrolet Corvette (C1)','A glassfibre-bodied American sports-car landmark.','influence'),
 ('Fiat 500',1957,'Fiat 500','Small-car design becomes an Italian cultural symbol.','italian'),
 ('Citroën 2CV',1948,'Citroën 2CV','Utility and unusual form distilled into an everyday car.','french'),
 ('Lancia Lambda',1922,'Lancia Lambda','Unitary construction changes the car beneath its skin.','influence'),
 ('NSU Ro 80',1967,'NSU Ro 80','A forward-looking aerodynamic saloon with rotary power.','influence'),
 ('Range Rover',1970,'Range Rover Classic','A new visual and practical language for the luxury 4×4.','influence'),
 ('Audi quattro',1980,'Audi Quattro','Rallying brings four-wheel drive into performance-car identity.','influence'),
 ('Nissan Leaf',2010,'Nissan Leaf (first generation)','A purpose-built electric family hatchback reaches the mainstream.','influence'),
 ('BMW M1',1978,'BMW M1','Giugiaro’s crisp surfaces applied to a mid-engined BMW.','m1'),
 ('DeLorean DMC-12',1981,'DMC DeLorean','Giugiaro’s wedge, stainless steel and gullwing doors become a cultural icon.','italdesign'),
 ('Honda NSX',1990,'Honda NSX (first generation)','The usable supercar, influential enough to inform the McLaren F1.','f1'),
]
data=dict(updated='19 October 2026',sources={k:dict(outlet=v[0],title=v[1],url=v[2]) for k,v in SOURCES.items()},cars=sorted(cars,key=lambda c:c['year']),honors=[dict(name=n,year=y,wiki=w,reason=r,source=s) for n,y,w,r,s in sorted(honors,key=lambda x:x[1])])
ROOT.joinpath('data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(f'{len(cars)} cars · {len(set(c["brand"] for c in cars))} brands · {sum(len(c["variants"]) for c in cars)} evolution entries')

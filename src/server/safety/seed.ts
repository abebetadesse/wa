/**
 * Starter reference for the safety matrix. Synced into `safety_substances` / `safety_interactions`
 * on first use (see ./index.ts); knowledge editors then add, correct or retire entries in the
 * admin screen, and their edits are kept on later syncs.
 *
 * Modern medicines follow Ethiopia's essential medicines list. Traditional entries are plants,
 * foods and drinks commonly used alongside them. Property tags describe well-established
 * pharmacology; plant tags describe reported effects and are marked with their evidence level.
 * Caution codes: P pregnancy, B breastfeeding, K kidney, L liver, C children, E older adults
 * (upper case = avoid, lower case = use with caution).
 */
import type { Severity } from "./rules";

export interface SeedSubstance {
  slug: string;
  name: string;
  kind: "modern" | "traditional";
  category: string;
  properties: string[];
  cautionCodes: string;
  aliases: string[];
  scientificName?: string;
  amharicName?: string;
  notes?: string;
  evidence?: string;
}

const M = (slug: string, name: string, category: string, properties: string, cautionCodes = "", aliases = "", notes?: string): SeedSubstance => ({
  slug,
  name,
  kind: "modern",
  category,
  properties: properties.split(" ").filter(Boolean),
  cautionCodes,
  aliases: aliases.split(";").map((a) => a.trim()).filter(Boolean),
  notes,
  evidence: "Established pharmacology",
});

const T = (slug: string, name: string, scientificName: string, amharicName: string, category: string, properties: string, cautionCodes = "", aliases = "", notes?: string, evidence = "Traditional use; limited studies"): SeedSubstance => ({
  slug,
  name,
  kind: "traditional",
  category,
  properties: properties.split(" ").filter(Boolean),
  cautionCodes,
  aliases: aliases.split(";").map((a) => a.trim()).filter(Boolean),
  scientificName,
  amharicName,
  notes,
  evidence,
});

const BLOOD = "Blood thinners";
const PAIN = "Pain & inflammation";
const DM = "Diabetes";
const CV = "Blood pressure & heart";
const ABX = "Antibiotics";
const TB = "Tuberculosis";
const HIV = "HIV";
const MAL = "Malaria";
const FUNG = "Antifungals";
const WORM = "Worms & parasites";
const NEURO = "Epilepsy";
const PSY = "Mental health & sleep";
const RESP = "Breathing & allergy";
const IMM = "Steroids & immune";
const GI = "Stomach & gut";
const HORM = "Hormones & pregnancy";
const VIT = "Vitamins & minerals";

export const SEED_SUBSTANCES: SeedSubstance[] = [
  // ── Blood thinners
  M("warfarin", "Warfarin", BLOOD, "anticoagulant vka cyp2c9_substrate_narrow narrow_therapeutic", "PlE", "Coumadin;Marevan"),
  M("heparin", "Heparin", BLOOD, "anticoagulant potassium_raising", "k"),
  M("enoxaparin", "Enoxaparin", BLOOD, "anticoagulant", "ke", "Clexane"),
  M("rivaroxaban", "Rivaroxaban", BLOOD, "anticoagulant cyp3a4_substrate_narrow", "PBkl", "Xarelto"),
  M("aspirin", "Aspirin", BLOOD, "antiplatelet nsaid", "pCk", "Acetylsalicylic acid;ASA", "Avoid in children under 16 (Reye's syndrome) unless prescribed."),
  M("clopidogrel", "Clopidogrel", BLOOD, "antiplatelet cyp2c19_prodrug", "l", "Plavix"),

  // ── Pain & inflammation
  M("paracetamol", "Paracetamol", PAIN, "hepatic_load", "l", "Acetaminophen;Panadol;Tylenol", "Liver damage in overdose or with regular heavy drinking."),
  M("ibuprofen", "Ibuprofen", PAIN, "nsaid", "PKe", "Brufen;Advil"),
  M("diclofenac", "Diclofenac", PAIN, "nsaid", "PKe", "Voltaren;Cataflam"),
  M("indomethacin", "Indomethacin", PAIN, "nsaid", "PKe", "Indocid"),
  M("naproxen", "Naproxen", PAIN, "nsaid", "PKe"),
  M("piroxicam", "Piroxicam", PAIN, "nsaid", "PKe", "Feldene"),
  M("mefenamic-acid", "Mefenamic acid", PAIN, "nsaid", "PKe", "Ponstan"),
  M("tramadol", "Tramadol", PAIN, "cns_depressant serotonergic seizure_threshold_lowering cyp2d6_prodrug", "PBe", "Tramal"),
  M("codeine", "Codeine", PAIN, "cns_depressant cyp2d6_prodrug", "PBCe"),
  M("morphine", "Morphine", PAIN, "cns_depressant", "PBke"),
  M("pethidine", "Pethidine", PAIN, "cns_depressant serotonergic", "Pke", "Meperidine"),

  // ── Diabetes
  M("metformin", "Metformin", DM, "hypoglycemic lactic_acidosis_risk", "K", "Glucophage"),
  M("glibenclamide", "Glibenclamide", DM, "hypoglycemic", "PKE", "Glyburide;Daonil"),
  M("glimepiride", "Glimepiride", DM, "hypoglycemic", "Pke", "Amaryl"),
  M("gliclazide", "Gliclazide", DM, "hypoglycemic", "Pk", "Diamicron"),
  M("insulin", "Insulin (regular / NPH / mixed)", DM, "hypoglycemic", "", "Actrapid;Insulatard;Mixtard"),

  // ── Blood pressure & heart
  M("enalapril", "Enalapril", CV, "hypotensive potassium_raising raas_blocker", "Pk", "Renitec"),
  M("lisinopril", "Lisinopril", CV, "hypotensive potassium_raising raas_blocker", "Pk"),
  M("captopril", "Captopril", CV, "hypotensive potassium_raising raas_blocker", "Pk"),
  M("losartan", "Losartan", CV, "hypotensive potassium_raising raas_blocker", "Pk", "Cozaar"),
  M("amlodipine", "Amlodipine", CV, "hypotensive cyp3a4_substrate", "p", "Norvasc"),
  M("nifedipine", "Nifedipine", CV, "hypotensive cyp3a4_substrate", "p", "Adalat"),
  M("hydrochlorothiazide", "Hydrochlorothiazide", CV, "diuretic hypotensive potassium_lowering", "pk", "HCT;HCTZ"),
  M("furosemide", "Furosemide", CV, "diuretic hypotensive potassium_lowering ototoxic", "pk", "Lasix"),
  M("spironolactone", "Spironolactone", CV, "diuretic hypotensive potassium_raising", "Pk", "Aldactone"),
  M("atenolol", "Atenolol", CV, "hypotensive bradycardic", "pk", "Tenormin"),
  M("propranolol", "Propranolol", CV, "hypotensive bradycardic", "p", "Inderal"),
  M("metoprolol", "Metoprolol", CV, "hypotensive bradycardic", "p"),
  M("carvedilol", "Carvedilol", CV, "hypotensive bradycardic", "p"),
  M("bisoprolol", "Bisoprolol", CV, "hypotensive bradycardic", "p"),
  M("methyldopa", "Methyldopa", CV, "hypotensive", "", "Aldomet", "Commonly used for high blood pressure in pregnancy."),
  M("hydralazine", "Hydralazine", CV, "hypotensive", ""),
  M("digoxin", "Digoxin", CV, "cardiac_glycoside narrow_therapeutic bradycardic", "KE", "Lanoxin"),
  M("amiodarone", "Amiodarone", CV, "qt_prolonging cyp3a4_inhibitor cyp2c9_inhibitor bradycardic photosensitizing", "PBl", "Cordarone"),
  M("atorvastatin", "Atorvastatin", CV, "cyp3a4_substrate", "PBl", "Lipitor"),
  M("simvastatin", "Simvastatin", CV, "cyp3a4_substrate_narrow", "PBl", "Zocor", "Muscle damage risk rises sharply when its breakdown is blocked."),
  M("isosorbide-dinitrate", "Isosorbide dinitrate", CV, "nitrate hypotensive", "", "Isordil"),
  M("glyceryl-trinitrate", "Glyceryl trinitrate", CV, "nitrate hypotensive", "", "Nitroglycerin;GTN"),
  M("sildenafil", "Sildenafil", CV, "pde5_inhibitor hypotensive cyp3a4_substrate", "", "Viagra"),

  // ── Antibiotics
  M("amoxicillin", "Amoxicillin", ABX, "", "", "Amoxil"),
  M("ampicillin", "Ampicillin", ABX, "", ""),
  M("amoxicillin-clavulanate", "Amoxicillin–clavulanate", ABX, "", "l", "Augmentin;Co-amoxiclav"),
  M("cloxacillin", "Cloxacillin", ABX, "", ""),
  M("benzylpenicillin", "Benzylpenicillin", ABX, "", "", "Penicillin G;Crystalline penicillin"),
  M("benzathine-penicillin", "Benzathine penicillin", ABX, "", ""),
  M("cephalexin", "Cephalexin", ABX, "", "k", "Keflex"),
  M("ceftriaxone", "Ceftriaxone", ABX, "", "", "Rocephin"),
  M("azithromycin", "Azithromycin", ABX, "qt_prolonging", "", "Zithromax"),
  M("erythromycin", "Erythromycin", ABX, "qt_prolonging cyp3a4_inhibitor", "l"),
  M("clarithromycin", "Clarithromycin", ABX, "qt_prolonging cyp3a4_inhibitor_strong", "pk", "Klacid"),
  M("ciprofloxacin", "Ciprofloxacin", ABX, "qt_prolonging cyp1a2_inhibitor chelation_sensitive seizure_threshold_lowering", "PBc", "Cipro"),
  M("norfloxacin", "Norfloxacin", ABX, "cyp1a2_inhibitor chelation_sensitive", "PBc"),
  M("levofloxacin", "Levofloxacin", ABX, "qt_prolonging chelation_sensitive seizure_threshold_lowering", "PBc"),
  M("doxycycline", "Doxycycline", ABX, "chelation_sensitive photosensitizing", "PBC"),
  M("tetracycline", "Tetracycline", ABX, "chelation_sensitive photosensitizing", "PBCK"),
  M("metronidazole", "Metronidazole", ABX, "disulfiram_like cyp2c9_inhibitor", "p", "Flagyl"),
  M("tinidazole", "Tinidazole", ABX, "disulfiram_like", "PB", "Fasigyn"),
  M("cotrimoxazole", "Cotrimoxazole", ABX, "cyp2c9_inhibitor potassium_raising bone_marrow_suppressant", "pk", "Bactrim;Septrin;Sulfamethoxazole–trimethoprim"),
  M("nitrofurantoin", "Nitrofurantoin", ABX, "", "K"),
  M("gentamicin", "Gentamicin", ABX, "nephrotoxic ototoxic", "PK"),
  M("chloramphenicol", "Chloramphenicol", ABX, "bone_marrow_suppressant", "PB"),
  M("clindamycin", "Clindamycin", ABX, "", ""),
  M("vancomycin", "Vancomycin", ABX, "nephrotoxic ototoxic", "k"),

  // ── Tuberculosis
  M("rifampicin", "Rifampicin", TB, "cyp3a4_inducer hepatotoxic", "l", "Rifampin;RHZE;RH"),
  M("isoniazid", "Isoniazid", TB, "hepatotoxic cyp2c9_inhibitor", "l", "INH"),
  M("pyrazinamide", "Pyrazinamide", TB, "hepatotoxic", "L", "PZA"),
  M("ethambutol", "Ethambutol", TB, "", "k"),
  M("streptomycin", "Streptomycin", TB, "nephrotoxic ototoxic", "PK"),

  // ── HIV
  M("tld", "Tenofovir–lamivudine–dolutegravir (TLD)", HIV, "nephrotoxic chelation_sensitive", "k", "TLD;Tenofovir/Lamivudine/Dolutegravir"),
  M("tenofovir", "Tenofovir (TDF)", HIV, "nephrotoxic", "k", "TDF"),
  M("lamivudine", "Lamivudine", HIV, "", "k", "3TC"),
  M("dolutegravir", "Dolutegravir", HIV, "chelation_sensitive", "", "DTG"),
  M("efavirenz", "Efavirenz", HIV, "cyp3a4_inducer qt_prolonging", "p", "EFV"),
  M("nevirapine", "Nevirapine", HIV, "cyp3a4_inducer hepatotoxic", "L", "NVP"),
  M("zidovudine", "Zidovudine", HIV, "bone_marrow_suppressant", "", "AZT"),
  M("abacavir", "Abacavir", HIV, "", "l", "ABC"),
  M("lopinavir-ritonavir", "Lopinavir–ritonavir", HIV, "cyp3a4_inhibitor_strong qt_prolonging", "l", "LPV/r;Kaletra"),
  M("atazanavir-ritonavir", "Atazanavir–ritonavir", HIV, "cyp3a4_inhibitor_strong acid_dependent", "l", "ATV/r"),

  // ── Malaria
  M("artemether-lumefantrine", "Artemether–lumefantrine", MAL, "qt_prolonging cyp3a4_substrate_narrow", "p", "Coartem;AL"),
  M("chloroquine", "Chloroquine", MAL, "qt_prolonging", ""),
  M("primaquine", "Primaquine", MAL, "hemolytic", "PB", "", "Check G6PD before use."),
  M("quinine", "Quinine", MAL, "qt_prolonging hypoglycemic", ""),
  M("artesunate", "Artesunate", MAL, "", "p"),

  // ── Antifungals
  M("fluconazole", "Fluconazole", FUNG, "cyp3a4_inhibitor cyp2c9_inhibitor qt_prolonging", "Pk", "Diflucan"),
  M("ketoconazole", "Ketoconazole (oral)", FUNG, "cyp3a4_inhibitor_strong hepatotoxic qt_prolonging acid_dependent", "PL", "Nizoral"),
  M("griseofulvin", "Griseofulvin", FUNG, "cyp3a4_inducer", "PL"),
  M("nystatin", "Nystatin", FUNG, "", ""),

  // ── Worms & parasites
  M("albendazole", "Albendazole", WORM, "", "P", "Zentel"),
  M("mebendazole", "Mebendazole", WORM, "", "P", "Vermox"),
  M("praziquantel", "Praziquantel", WORM, "cyp3a4_substrate", "", "Biltricide"),
  M("ivermectin", "Ivermectin", WORM, "", "PB", "Mectizan"),
  M("niclosamide", "Niclosamide", WORM, "", ""),

  // ── Epilepsy
  M("phenobarbital", "Phenobarbital", NEURO, "cyp3a4_inducer cns_depressant", "PE", "Phenobarbitone;Luminal"),
  M("phenytoin", "Phenytoin", NEURO, "cyp3a4_inducer cyp2c9_substrate_narrow narrow_therapeutic", "P", "Epanutin;Dilantin"),
  M("carbamazepine", "Carbamazepine", NEURO, "cyp3a4_inducer cyp3a4_substrate_narrow narrow_therapeutic", "P", "Tegretol"),
  M("valproate", "Sodium valproate", NEURO, "hepatotoxic", "PL", "Valproic acid;Epilim;Depakine"),

  // ── Mental health & sleep
  M("diazepam", "Diazepam", PSY, "cns_depressant cyp3a4_substrate", "PBE", "Valium"),
  M("lorazepam", "Lorazepam", PSY, "cns_depressant", "PBE"),
  M("chlorpromazine", "Chlorpromazine", PSY, "qt_prolonging cns_depressant anticholinergic hypotensive", "pE", "Largactil"),
  M("haloperidol", "Haloperidol", PSY, "qt_prolonging cns_depressant", "pE"),
  M("risperidone", "Risperidone", PSY, "qt_prolonging hypotensive", "pe"),
  M("olanzapine", "Olanzapine", PSY, "cns_depressant anticholinergic hyperglycemic cyp1a2_substrate", "pe"),
  M("amitriptyline", "Amitriptyline", PSY, "serotonergic qt_prolonging cns_depressant anticholinergic", "pE"),
  M("imipramine", "Imipramine", PSY, "serotonergic qt_prolonging cns_depressant anticholinergic", "pE"),
  M("fluoxetine", "Fluoxetine", PSY, "serotonergic cyp2d6_inhibitor bleeding_risk", "p", "Prozac"),
  M("sertraline", "Sertraline", PSY, "serotonergic bleeding_risk", "p", "Zoloft"),
  M("lithium", "Lithium carbonate", PSY, "narrow_renal narrow_therapeutic", "PBK"),
  M("promethazine", "Promethazine", RESP, "cns_depressant anticholinergic", "CE", "Phenergan"),
  M("chlorpheniramine", "Chlorphenamine", RESP, "cns_depressant anticholinergic", "e", "Chlorpheniramine;Piriton"),
  M("biperiden", "Biperiden", PSY, "anticholinergic", "E", "Akineton"),

  // ── Breathing & allergy
  M("salbutamol", "Salbutamol", RESP, "potassium_lowering stimulant", "", "Albuterol;Ventolin"),
  M("aminophylline", "Aminophylline / theophylline", RESP, "cyp1a2_substrate narrow_therapeutic seizure_threshold_lowering stimulant", "e", "Theophylline"),
  M("beclomethasone", "Beclomethasone inhaler", RESP, "", ""),

  // ── Steroids & immune
  M("prednisolone", "Prednisolone", IMM, "hyperglycemic immunosuppressant corticosteroid", "", "Prednisone"),
  M("dexamethasone", "Dexamethasone", IMM, "hyperglycemic immunosuppressant corticosteroid", ""),
  M("hydrocortisone", "Hydrocortisone", IMM, "hyperglycemic corticosteroid", ""),
  M("methotrexate", "Methotrexate", IMM, "bone_marrow_suppressant hepatotoxic narrow_therapeutic", "PBKL"),
  M("azathioprine", "Azathioprine", IMM, "immunosuppressant bone_marrow_suppressant", "pl"),
  M("cyclosporine", "Ciclosporin", IMM, "immunosuppressant cyp3a4_substrate_narrow nephrotoxic potassium_raising", "k", "Cyclosporine"),
  M("hydroxychloroquine", "Hydroxychloroquine", IMM, "qt_prolonging", ""),
  M("allopurinol", "Allopurinol", IMM, "urate_lowering", "k", "Zyloric"),
  M("colchicine", "Colchicine", IMM, "cyp3a4_substrate_narrow", "PK"),

  // ── Stomach & gut
  M("omeprazole", "Omeprazole", GI, "cyp2c19_inhibitor acid_suppressant", "", "Losec"),
  M("cimetidine", "Cimetidine", GI, "cyp3a4_inhibitor cyp1a2_inhibitor cyp2c9_inhibitor acid_suppressant", "k"),
  M("antacid", "Aluminium/magnesium hydroxide antacid", GI, "polyvalent_cation", "k", "Antacid;Maalox;Gelusil"),
  M("metoclopramide", "Metoclopramide", GI, "cns_depressant", "Ce", "Plasil;Maxolon"),
  M("ondansetron", "Ondansetron", GI, "qt_prolonging serotonergic", "", "Zofran"),
  M("loperamide", "Loperamide", GI, "", "C", "Imodium"),
  M("bisacodyl", "Bisacodyl", GI, "laxative_stimulant potassium_lowering", "", "Dulcolax"),
  M("hyoscine-butylbromide", "Hyoscine butylbromide", GI, "anticholinergic", "e", "Buscopan"),

  // ── Hormones & pregnancy
  M("combined-oral-contraceptive", "Combined oral contraceptive pill", HORM, "hormonal_contraceptive cyp3a4_substrate", "P", "Microgynon;The pill;COC"),
  M("levonorgestrel", "Levonorgestrel (emergency / implant)", HORM, "hormonal_contraceptive", "", "Postinor;Jadelle"),
  M("medroxyprogesterone", "Medroxyprogesterone injection", HORM, "", "", "Depo-Provera;Depo", "Injectable contraception is not weakened by enzyme inducers."),
  M("levothyroxine", "Levothyroxine", HORM, "chelation_sensitive narrow_therapeutic", "", "Thyroxine;Eltroxin"),
  M("oxytocin", "Oxytocin", HORM, "uterotonic", "", "Pitocin"),
  M("misoprostol", "Misoprostol", HORM, "uterotonic", "P", "Cytotec"),
  M("ergometrine", "Ergometrine", HORM, "uterotonic hypertensive", "P"),

  // ── Vitamins & minerals
  M("ferrous-sulfate", "Ferrous sulfate (iron)", VIT, "polyvalent_cation acid_dependent", "", "Iron tablets;Ferrous"),
  M("calcium-carbonate", "Calcium carbonate", VIT, "polyvalent_cation", "k"),
  M("zinc-sulfate", "Zinc sulfate", VIT, "polyvalent_cation", ""),
  M("folic-acid", "Folic acid", VIT, "", ""),
  M("vitamin-k", "Phytomenadione (vitamin K)", VIT, "vitamin_k", "", "Vitamin K1"),
  M("potassium-chloride", "Potassium chloride", VIT, "potassium_raising", "K"),

  // ── Traditional: medicinal plants
  T("tena-adam", "Tena Adam (rue)", "Ruta chalepensis", "ጤና አዳም", "Medicinal plant", "bleeding_risk uterotonic photosensitizing cyp3a4_inhibitor", "PB", "Tenadam;Rue;Chalepensis", "Added to coffee (buna) and used for stomach complaints."),
  T("tikur-azmud", "Tikur azmud (black seed)", "Nigella sativa", "ጥቁር አዝሙድ", "Medicinal plant", "hypoglycemic hypotensive bleeding_risk", "p", "Black cumin;Habbat al-sauda;Nigella"),
  T("damakesse", "Damakesse", "Ocimum lamiifolium", "ዳማከሴ", "Medicinal plant", "hypotensive", "p", "Damakese", "Fever, headache and cold remedy."),
  T("feto", "Feto (garden cress)", "Lepidium sativum", "ፌጦ", "Medicinal plant", "diuretic hypoglycemic uterotonic", "P", "Garden cress;Fetto"),
  T("tosign", "Tosign (highland thyme)", "Thymus schimperi", "ጦስኝ", "Medicinal plant", "bleeding_risk", "p", "Tosigne;Thyme"),
  T("gesho", "Gesho", "Rhamnus prinoides", "ጌሾ", "Medicinal plant", "laxative_stimulant", "p", "Buckthorn", "Used to brew tella and tej."),
  T("moringa", "Moringa (shiferaw / haleko)", "Moringa stenopetala", "ሽፈራው", "Medicinal plant", "hypoglycemic hypotensive cyp3a4_inhibitor uterotonic", "P", "Shiferaw;Haleko;Aleko;Moringa oleifera", "Root and bark have womb-stimulating effects; leaves are eaten."),
  T("grawa", "Grawa (bitter leaf)", "Vernonia amygdalina", "ግራዋ", "Medicinal plant", "hypoglycemic hypotensive", "P", "Bitter leaf;Girawa"),
  T("koseret", "Koseret", "Lippia adoensis", "ኮሰረት", "Medicinal plant", "", "p", "Kosseret"),
  T("besobila", "Besobila (sacred basil)", "Ocimum basilicum", "በሶብላ", "Medicinal plant", "hypoglycemic", "p", "Basil;Besobela"),
  T("endod", "Endod (soapberry)", "Phytolacca dodecandra", "እንዶድ", "Medicinal plant", "toxic_internal gi_irritant", "PBCKLE", "Soapberry", "Used as soap and against snails; poisonous if swallowed.", "Toxicology reports"),
  T("astenagir", "Astenagir (thorn apple)", "Datura stramonium", "አስተናግር", "Medicinal plant", "toxic_internal anticholinergic", "PBCKLE", "Datura;Jimsonweed", "Poisonous; confusion, hallucinations, fast heart.", "Toxicology reports"),
  T("gulo", "Gulo (castor)", "Ricinus communis", "ጉሎ", "Medicinal plant", "laxative_stimulant potassium_lowering uterotonic", "PB", "Castor;Castor oil"),
  T("sena", "Sena (senna)", "Senna alexandrina", "ሴና", "Anthelmintic & purgative", "laxative_stimulant potassium_lowering", "pb", "Senna;Cassia"),
  T("ret", "Ret (aloe)", "Aloe spp.", "ሬት", "Medicinal plant", "laxative_stimulant potassium_lowering hypoglycemic", "PB", "Aloe;Aloe vera", "The yellow latex is a strong purgative."),
  T("kebercho", "Kebercho", "Echinops kebericho", "ከበርቾ", "Medicinal plant", "", "P", "Kebericho", "Mostly burned as fumigant."),
  T("dingetegna", "Dingetegna", "Taverniera abyssinica", "ድንገተኛ", "Medicinal plant", "", "p"),
  T("bisana", "Bisana", "Croton macrostachyus", "ብሳና", "Anthelmintic & purgative", "laxative_stimulant hepatic_load", "PBC"),
  T("abalo", "Abalo", "Brucea antidysenterica", "አባሎ", "Anthelmintic & purgative", "gi_irritant", "PBC"),
  T("enkoko", "Enkoko", "Embelia schimperi", "እንቆቆ", "Anthelmintic & purgative", "gi_irritant", "PBC", "Enqoqo"),
  T("metere", "Metere", "Glinus lotoides", "ሜተሬ", "Anthelmintic & purgative", "gi_irritant", "PB"),
  T("kosso", "Kosso", "Hagenia abyssinica", "ኮሶ", "Anthelmintic & purgative", "laxative_stimulant gi_irritant potassium_lowering", "PBCkl", "Koso;Hagenia", "Traditional tapeworm treatment; strong purgative."),
  T("duba-fre", "Duba fre (pumpkin seed)", "Cucurbita pepo", "ዱባ ፍሬ", "Anthelmintic & purgative", "", "", "Pumpkin seed", "A gentle traditional tapeworm remedy."),
  T("chikugn", "Chikugn", "Artemisia abyssinica", "ጭቁኝ", "Medicinal plant", "seizure_threshold_lowering uterotonic", "PBC"),
  T("ariti", "Ariti", "Artemisia afra", "አሪቲ", "Medicinal plant", "seizure_threshold_lowering uterotonic", "PBC", "African wormwood"),
  T("agam", "Agam", "Carissa spinarum", "አጋም", "Medicinal plant", "hypotensive", "p", "Carissa"),
  T("tult", "Tult", "Rumex nepalensis", "ቱልት", "Medicinal plant", "laxative_stimulant", "p"),
  T("mekmeko", "Mekmeko", "Rumex abyssinicus", "መቅመቆ", "Medicinal plant", "laxative_stimulant", "p"),
  T("gorteb", "Gorteb (plantain)", "Plantago lanceolata", "ጎርተብ", "Medicinal plant", "absorption_reducing", "", "Plantain"),
  T("gizawa", "Gizawa (ashwagandha)", "Withania somnifera", "ጊዛዋ", "Medicinal plant", "cns_depressant immunostimulant hypoglycemic hypotensive", "PB", "Ashwagandha"),
  T("misirich", "Misirich", "Clerodendrum myricoides", "ምስርች", "Medicinal plant", "", "P"),
  T("sensel", "Sensel", "Justicia schimperiana", "ስንሰል", "Medicinal plant", "", "p"),
  T("hareg-resa", "Hareg resa", "Zehneria scabra", "ሐረግ ረሳ", "Medicinal plant", "", "p"),
  T("amja", "Amja", "Hypericum revolutum", "አምጃ", "Medicinal plant", "cyp3a4_inducer_weak photosensitizing", "PB", "", "Tagged by analogy with St John's wort (same genus).", "Genus analogy; not studied directly"),
  T("digita", "Digita", "Calpurnia aurea", "ዲግታ", "Medicinal plant", "toxic_internal", "PBCKLE", "", "Used externally (e.g. against lice).", "Toxicology reports"),
  T("mefakia", "Mefakia (tooth stick)", "Salvadora persica", "መፋቂያ", "Medicinal plant", "", "", "Miswak;Toothbrush tree"),
  T("bahir-zaf", "Bahir zaf (eucalyptus)", "Eucalyptus globulus", "ባሕር ዛፍ", "Medicinal plant", "toxic_internal", "C", "Eucalyptus", "Steam inhalation is common; the oil is poisonous if swallowed, especially by children."),
  T("kulkual", "Kulkual (euphorbia)", "Euphorbia candelabrum", "ቁልቋል", "Medicinal plant", "toxic_internal gi_irritant", "PBCKLE", "Candelabra tree"),
  T("woyra", "Woyra (wild olive)", "Olea europaea subsp. cuspidata", "ወይራ", "Medicinal plant", "hypotensive hypoglycemic", "p", "Olive leaf", "Used as fumigant and leaf tea."),
  T("girar", "Girar (acacia)", "Acacia nilotica", "ግራር", "Medicinal plant", "hypoglycemic absorption_reducing", "p", "Acacia"),
  T("qontir", "Qontir", "Acacia abyssinica", "ቆንቲር", "Medicinal plant", "", ""),
  T("itan", "Itan (frankincense)", "Boswellia papyrifera", "ዕጣን", "Medicinal plant", "", "p", "Frankincense;Lubanj;Etan", "Mostly burned as incense and fumigant; little is swallowed."),
  T("karbe", "Karbe (myrrh)", "Commiphora myrrha", "ከርቤ", "Medicinal plant", "uterotonic hypoglycemic", "PB", "Myrrh;Kerbe", "Traditionally used to bring on menstruation; avoid in pregnancy."),
  T("kega", "Kega (wild rose)", "Rosa abyssinica", "ቀጋ", "Medicinal plant", "", "", "Wild rose;Abyssinian rose", "Petals and hips are made into tea."),
  T("yemdir-berbere", "Yemdir berbere", "Acmella caulirhiza", "የምድር በርበሬ", "Medicinal plant", "", "p", "", "Numbing toothache remedy."),

  // ── Traditional: spices & food plants
  T("nech-shinkurt", "Nech shinkurt (garlic)", "Allium sativum", "ነጭ ሽንኩርት", "Spice & food plant", "bleeding_risk cyp3a4_inducer_weak hypotensive", "", "Garlic", "Normal cooking amounts are fine; concentrated or raw daily remedies matter.", "Clinical and pharmacokinetic studies"),
  T("zinjibil", "Zinjibil (ginger)", "Zingiber officinale", "ዝንጅብል", "Spice & food plant", "bleeding_risk hypoglycemic", "", "Ginger", undefined, "Clinical studies"),
  T("abish", "Abish (fenugreek)", "Trigonella foenum-graecum", "አብሽ", "Spice & food plant", "hypoglycemic bleeding_risk absorption_reducing uterotonic", "P", "Fenugreek", undefined, "Clinical studies"),
  T("telba", "Telba (linseed)", "Linum usitatissimum", "ተልባ", "Spice & food plant", "absorption_reducing hypoglycemic", "", "Linseed;Flaxseed"),
  T("ensilal", "Ensilal (fennel)", "Foeniculum vulgare", "እንስላል", "Spice & food plant", "estrogenic", "p", "Fennel;Insilal"),
  T("dimbilal", "Dimbilal (coriander)", "Coriandrum sativum", "ድምብላል", "Spice & food plant", "hypoglycemic", "", "Coriander"),
  T("ird", "Ird (turmeric)", "Curcuma longa", "እርድ", "Spice & food plant", "bleeding_risk cyp3a4_inhibitor hypoglycemic", "", "Turmeric", undefined, "Clinical studies"),
  T("kerefa", "Kerefa (cinnamon)", "Cinnamomum spp.", "ቀረፋ", "Spice & food plant", "hypoglycemic hepatic_load", "", "Cinnamon;Cassia", "Cassia cinnamon contains coumarin, which strains the liver in large amounts."),
  T("krinfud", "Krinfud (clove)", "Syzygium aromaticum", "ቅርንፉድ", "Spice & food plant", "bleeding_risk", "", "Clove"),
  T("berbere", "Berbere (chili blend)", "Capsicum spp.", "በርበሬ", "Spice & food plant", "gi_irritant", "", "Chili;Mitmita"),
  T("timiz", "Timiz (long pepper)", "Piper capense", "ጥምዝ", "Spice & food plant", "cyp3a4_inhibitor", "", "Long pepper", "Pepper compounds (piperine) can raise medicine levels.", "Pharmacological studies"),
  T("korerima", "Korerima", "Aframomum corrorima", "ኮረሪማ", "Spice & food plant", "", "", "Ethiopian cardamom"),
  T("tej-sar", "Tej sar (lemongrass)", "Cymbopogon citratus", "የጤና ሳር", "Spice & food plant", "diuretic hypotensive", "p", "Lemongrass"),
  T("gomen", "Gomen (Ethiopian kale)", "Brassica carinata", "ጎመን", "Spice & food plant", "vitamin_k", "", "Collard greens;Kale", "Very rich in vitamin K; keep intake steady on warfarin.", "Nutrient composition"),
  T("mar", "Mar (honey)", "Apis mellifera product", "ማር", "Spice & food plant", "hyperglycemic", "C", "Honey", "Not for babies under 1 year."),

  // ── Traditional: drinks & stimulants
  T("khat", "Khat (chat)", "Catha edulis", "ጫት", "Drinks & stimulants", "stimulant hypertensive hepatic_load", "PB", "Chat;Qat;Miraa", undefined, "Clinical and pharmacokinetic studies"),
  T("buna", "Buna (coffee)", "Coffea arabica", "ቡና", "Drinks & stimulants", "stimulant cyp1a2_substrate", "p", "Coffee", undefined, "Clinical studies"),
  T("shai", "Shai (tea)", "Camellia sinensis", "ሻይ", "Drinks & stimulants", "stimulant cyp1a2_substrate", "", "Tea"),
  T("tella", "Tella (home-brewed beer)", "Fermented cereal with gesho", "ጠላ", "Drinks & stimulants", "alcohol cns_depressant", "", "Talla;Home beer", undefined, "Established pharmacology of alcohol"),
  T("tej", "Tej (honey wine)", "Fermented honey with gesho", "ጠጅ", "Drinks & stimulants", "alcohol cns_depressant hyperglycemic", "", "Honey wine;Mead", undefined, "Established pharmacology of alcohol"),
  T("areke", "Areke (distilled spirit)", "Distilled cereal spirit", "አረቄ", "Drinks & stimulants", "alcohol cns_depressant", "", "Arake;Katikala", undefined, "Established pharmacology of alcohol"),
];

export interface SeedInteraction {
  a: string;
  b: string;
  severity: Severity;
  mechanism: string;
  effect: string;
  management: string;
  evidence: string;
  source: string;
}

const I = (a: string, b: string, severity: Severity, mechanism: string, effect: string, management: string, evidence: string, source: string): SeedInteraction => ({ a, b, severity, mechanism, effect, management, evidence, source });
const STOCKLEY = "Stockley's Drug Interactions / BNF interaction guidance";
const ETH_HIV = "Ethiopian national consolidated HIV guidelines";
const ETH_TB = "Ethiopian national TB/TB-HIV guidelines";

export const SEED_INTERACTIONS: SeedInteraction[] = [
  // Blood thinners
  I("warfarin", "metronidazole", "major", "Metronidazole blocks warfarin breakdown.", "INR rises sharply; bleeding.", "Avoid, or reduce warfarin and check INR within 3–5 days.", "Clinical", STOCKLEY),
  I("warfarin", "cotrimoxazole", "major", "Cotrimoxazole blocks warfarin breakdown.", "INR rises; bleeding.", "Prefer another antibiotic, or monitor INR closely.", "Clinical", STOCKLEY),
  I("warfarin", "fluconazole", "major", "Fluconazole blocks CYP2C9.", "INR rises; bleeding.", "Monitor INR; a lower warfarin dose is often needed.", "Clinical", STOCKLEY),
  I("warfarin", "rifampicin", "major", "Rifampicin speeds warfarin clearance.", "Warfarin stops working; clots.", "Large dose increases are needed; check INR often, and again when rifampicin stops.", "Clinical", STOCKLEY),
  I("warfarin", "aspirin", "major", "Blood-thinning effects add.", "Serious bleeding.", "Only when a specialist intends it.", "Clinical", STOCKLEY),
  I("warfarin", "amiodarone", "major", "Amiodarone blocks warfarin breakdown for months.", "INR rises; bleeding.", "Reduce warfarin by about a third to a half; monitor INR.", "Clinical", STOCKLEY),
  I("warfarin", "paracetamol", "moderate", "Regular paracetamol can raise INR.", "Bleeding with regular high doses.", "Occasional doses are fine; check INR if taken daily.", "Clinical", STOCKLEY),
  I("warfarin", "gomen", "moderate", "Large changes in vitamin K intake change warfarin's effect.", "INR falls (clots) or rises when intake drops.", "Keep gomen and leafy greens steady week to week rather than avoiding them.", "Clinical (vitamin K)", STOCKLEY),
  I("warfarin", "nech-shinkurt", "moderate", "Garlic has antiplatelet effects.", "Increased bleeding and INR reports.", "Avoid concentrated or raw daily garlic remedies.", "Case reports", "Herb–drug interaction reviews"),
  I("warfarin", "zinjibil", "moderate", "Ginger inhibits platelet aggregation.", "Increased bleeding risk.", "Avoid large daily ginger remedies.", "Case reports", "Herb–drug interaction reviews"),
  I("warfarin", "abish", "moderate", "Fenugreek contains coumarins and affects platelets.", "INR rise and bleeding reported.", "Avoid fenugreek remedies; food amounts need steady intake.", "Case reports", "Herb–drug interaction reviews"),
  I("clopidogrel", "omeprazole", "moderate", "Omeprazole blocks clopidogrel activation.", "Less protection from heart attack and stroke.", "Use pantoprazole or an H2 blocker instead.", "Clinical", STOCKLEY),

  // Heart & kidneys
  I("sildenafil", "isosorbide-dinitrate", "contraindicated", "Both release nitric oxide pathways.", "Severe low blood pressure.", "Never combine.", "Clinical", STOCKLEY),
  I("sildenafil", "glyceryl-trinitrate", "contraindicated", "Both release nitric oxide pathways.", "Severe low blood pressure.", "Never combine; no nitrate within 24 hours of sildenafil.", "Clinical", STOCKLEY),
  I("enalapril", "spironolactone", "major", "Both raise potassium.", "Dangerous hyperkalaemia.", "Check potassium and kidney function regularly.", "Clinical", STOCKLEY),
  I("digoxin", "furosemide", "moderate", "Furosemide lowers potassium.", "Digoxin toxicity.", "Check potassium; supplement if low.", "Clinical", STOCKLEY),
  I("digoxin", "amiodarone", "major", "Amiodarone raises digoxin levels.", "Digoxin toxicity.", "Halve the digoxin dose and check levels.", "Clinical", STOCKLEY),
  I("simvastatin", "clarithromycin", "contraindicated", "Clarithromycin blocks simvastatin breakdown.", "Severe muscle breakdown (rhabdomyolysis).", "Stop simvastatin during the antibiotic course.", "Clinical", STOCKLEY),
  I("simvastatin", "lopinavir-ritonavir", "contraindicated", "Ritonavir blocks simvastatin breakdown.", "Severe muscle damage.", "Use another statin (e.g. low-dose atorvastatin).", "Clinical", ETH_HIV),
  I("lithium", "ibuprofen", "major", "NSAIDs reduce lithium clearance.", "Lithium toxicity.", "Avoid; use paracetamol for pain.", "Clinical", STOCKLEY),
  I("lithium", "hydrochlorothiazide", "major", "Thiazides reduce lithium clearance.", "Lithium toxicity.", "Avoid, or lower lithium and monitor levels.", "Clinical", STOCKLEY),

  // Infections, TB and HIV
  I("rifampicin", "combined-oral-contraceptive", "major", "Rifampicin speeds hormone clearance.", "Contraceptive failure.", "Use injectable, IUD or condoms during and for 4 weeks after.", "Clinical", ETH_TB),
  I("rifampicin", "dolutegravir", "major", "Rifampicin speeds dolutegravir clearance.", "HIV treatment failure and resistance.", "Give dolutegravir 50 mg twice daily during and 2 weeks after rifampicin.", "Clinical", ETH_HIV),
  I("rifampicin", "tld", "major", "Rifampicin speeds dolutegravir clearance.", "HIV treatment failure.", "Add an extra 50 mg dolutegravir 12 hours after TLD during and 2 weeks after rifampicin.", "Clinical", ETH_HIV),
  I("rifampicin", "nevirapine", "contraindicated", "Rifampicin sharply lowers nevirapine levels; both strain the liver.", "HIV treatment failure and liver injury.", "Do not combine; use an efavirenz- or dolutegravir-based regimen.", "Clinical", ETH_HIV),
  I("rifampicin", "lopinavir-ritonavir", "contraindicated", "Rifampicin lowers protease inhibitor levels drastically.", "HIV treatment failure.", "Use rifabutin or change the HIV regimen under specialist care.", "Clinical", ETH_HIV),
  I("rifampicin", "praziquantel", "major", "Rifampicin almost removes praziquantel from the blood.", "Schistosomiasis treatment fails.", "Wait 4 weeks after rifampicin or use a specialist plan.", "Pharmacokinetic", STOCKLEY),
  I("rifampicin", "artemether-lumefantrine", "major", "Rifampicin sharply lowers lumefantrine.", "Malaria treatment failure.", "Avoid together; seek specialist advice.", "Pharmacokinetic", STOCKLEY),
  I("efavirenz", "artemether-lumefantrine", "moderate", "Efavirenz lowers lumefantrine levels.", "Higher risk of malaria treatment failure.", "Complete the full course; watch for recurrence.", "Pharmacokinetic", ETH_HIV),
  I("isoniazid", "phenytoin", "major", "Isoniazid blocks phenytoin breakdown.", "Phenytoin toxicity: unsteadiness, drowsiness.", "Monitor phenytoin levels.", "Clinical", STOCKLEY),
  I("carbamazepine", "combined-oral-contraceptive", "major", "Carbamazepine speeds hormone clearance.", "Contraceptive failure.", "Use injectable, IUD or condoms.", "Clinical", STOCKLEY),
  I("ciprofloxacin", "aminophylline", "major", "Ciprofloxacin blocks theophylline breakdown.", "Theophylline toxicity: vomiting, fast heart, seizures.", "Avoid, or reduce theophylline and monitor.", "Clinical", STOCKLEY),
  I("ciprofloxacin", "antacid", "moderate", "Aluminium and magnesium bind ciprofloxacin.", "Antibiotic fails.", "Take ciprofloxacin 2 hours before or 6 hours after.", "Clinical", STOCKLEY),
  I("ciprofloxacin", "ferrous-sulfate", "moderate", "Iron binds ciprofloxacin.", "Antibiotic fails.", "Separate by at least 2 hours before / 6 hours after.", "Clinical", STOCKLEY),
  I("doxycycline", "ferrous-sulfate", "moderate", "Iron binds doxycycline.", "Antibiotic fails.", "Separate by 2–3 hours.", "Clinical", STOCKLEY),
  I("dolutegravir", "ferrous-sulfate", "moderate", "Iron binds dolutegravir.", "HIV treatment may fail.", "Take dolutegravir 2 hours before or 6 hours after iron, or together with food.", "Clinical", ETH_HIV),
  I("dolutegravir", "metformin", "moderate", "Dolutegravir raises metformin levels.", "More stomach upset and lactic acidosis risk.", "Limit metformin to 1 g/day and monitor.", "Clinical", ETH_HIV),
  I("metronidazole", "tella", "major", "Metronidazole blocks alcohol breakdown.", "Flushing, vomiting, palpitations.", "No tella, tej or areke during and for 3 days after.", "Clinical", STOCKLEY),
  I("metronidazole", "tej", "major", "Metronidazole blocks alcohol breakdown.", "Flushing, vomiting, palpitations.", "No alcohol during and for 3 days after.", "Clinical", STOCKLEY),
  I("metronidazole", "areke", "major", "Metronidazole blocks alcohol breakdown.", "Flushing, vomiting, palpitations.", "No alcohol during and for 3 days after.", "Clinical", STOCKLEY),
  I("cotrimoxazole", "methotrexate", "contraindicated", "Both block folate and methotrexate clearance falls.", "Severe bone-marrow suppression.", "Avoid the combination.", "Clinical", STOCKLEY),
  I("allopurinol", "azathioprine", "major", "Allopurinol blocks azathioprine breakdown.", "Life-threatening bone-marrow suppression.", "Cut azathioprine to a quarter under specialist care, or avoid.", "Clinical", STOCKLEY),

  // Mind & pain
  I("tramadol", "fluoxetine", "major", "Both raise serotonin; fluoxetine also blocks tramadol activation.", "Serotonin syndrome and seizures; poorer pain relief.", "Choose another painkiller.", "Clinical", STOCKLEY),
  I("fluoxetine", "amitriptyline", "major", "Fluoxetine raises amitriptyline levels; serotonin adds up.", "Toxicity and serotonin syndrome.", "Avoid, or use low doses with monitoring.", "Clinical", STOCKLEY),
  I("paracetamol", "areke", "major", "Regular alcohol depletes liver defences against paracetamol.", "Liver damage even at normal doses.", "Keep paracetamol to 2 g/day or less with regular drinking.", "Clinical", STOCKLEY),

  // Traditional drinks and plants (documented)
  I("khat", "amoxicillin", "moderate", "Chewing khat slows stomach emptying and absorption.", "Lower antibiotic levels.", "Take the antibiotic at least 2 hours after chewing.", "Pharmacokinetic study", "Attef et al., J Antimicrob Chemother 1997 (khat and ampicillin/amoxycillin)"),
  I("khat", "ampicillin", "major", "Chewing khat markedly reduces ampicillin absorption.", "The antibiotic may fail.", "Do not chew khat within 2 hours of doses.", "Pharmacokinetic study", "Attef et al., J Antimicrob Chemother 1997 (khat and ampicillin/amoxycillin)"),
  I("buna", "ciprofloxacin", "moderate", "Ciprofloxacin slows caffeine breakdown.", "Jitteriness, fast heart, poor sleep.", "Cut down coffee during the course.", "Clinical", STOCKLEY),
  I("buna", "aminophylline", "moderate", "Caffeine competes with theophylline.", "Theophylline side effects.", "Keep coffee intake low and steady.", "Clinical", STOCKLEY),
  I("buna", "lithium", "moderate", "Changing coffee intake changes lithium levels.", "Sudden stop can raise lithium.", "Keep coffee intake steady.", "Clinical", STOCKLEY),
  I("ensilal", "ciprofloxacin", "moderate", "Fennel reduced ciprofloxacin absorption in studies.", "Lower antibiotic levels.", "Avoid fennel remedies within 2 hours of doses.", "Animal pharmacokinetic study", "Herb–drug interaction reviews"),
  I("nech-shinkurt", "lopinavir-ritonavir", "moderate", "Garlic supplements lowered protease inhibitor levels.", "HIV treatment may weaken.", "Avoid garlic supplements; food amounts are fine.", "Pharmacokinetic study", "Herb–drug interaction reviews"),
  I("tena-adam", "warfarin", "major", "Furanocoumarins and rutin add antiplatelet effects and inhibit CYP3A4 metabolism.", "Serious bleeding.", "Do not use Tena Adam remedies with blood thinners.", "Platform reference (review)", "ETM-SAFETY-WAR-01"),
  I("kosso", "warfarin", "major", "Kosotoxin irritates the gut lining and strains the liver.", "Gut bleeding.", "Avoid kosso while on blood thinners.", "Platform reference (review)", "ETM-SAFETY-KOS-02"),
  I("kosso", "metformin", "moderate", "Purging, fluid loss and metabolic strain.", "Dehydration and unstable blood sugar.", "Avoid; if used, stop metformin that day and drink fluids.", "Platform reference (review)", "ETM-SAFETY-KOS-03"),
  I("tikur-azmud", "metformin", "moderate", "Thymoquinone lowers blood sugar alongside diabetes medicines.", "Low blood sugar.", "Check blood sugar more often.", "Platform reference (review)", "ETM-SAFETY-GLU-03"),
  I("damakesse", "enalapril", "moderate", "Additive blood-vessel relaxation.", "Dizziness and fainting.", "Stand up slowly; check blood pressure.", "Platform reference (review)", "ETM-SAFETY-HYP-04"),
  I("feto", "furosemide", "moderate", "Additive water and potassium losses.", "Dehydration and low potassium.", "Drink enough; check potassium.", "Platform reference (review)", "ETM-SAFETY-DIU-05"),
];

cd('/Users/rickwassing/Documents/Work/asa-res-comm/funding-analysis')

tmp = readtable('ARC.csv', 'DatetimeType','text');
D = tmp(:, 1:8);
tmp = readtable('MRFF.xlsx', 'DatetimeType','text');
D = [D; tmp(:, 1:8)];
tmp = readtable('NHMRC.xlsx', 'DatetimeType','text', 'ReadVariableNames', true);
D = [D; tmp(:, 1:8)];

%% Data cleaning

D.Funding(isnan(D.Funding)) = 0;
D.Organisation(cellfun(@(o) isempty(o), D.Organisation)) = {'Unknown'};
D.Organisation(strcmpi(D.Organisation, 'Centre For Eye Research Australia Limited')) = {'Centre for Eye Research Australia'};
D.Organisation(strcmpi(D.Organisation, 'Centre for Eye Research Australia')) = {'Centre for Eye Research Australia'};
D.Organisation(strcmpi(D.Organisation, 'Bionics Institute of Australia')) = {'Bionics Institute'};
D.Organisation(strcmpi(D.Organisation, 'Adelaide University')) = {'The University of Adelaide'};
D.Organisation(strcmpi(D.Organisation, 'Heart Research Institute Ltd')) = {'Heart Research Institute'};
D.Organisation(strcmpi(D.Organisation, 'South Australian Health and Medical Research Institute Limited')) = {'South Australian Health and Medical Research Institute'};
D.Organisation(strcmpi(D.Organisation, 'Bond University Limited')) = {'Bond University'};
D.Organisation(strcmpi(D.Organisation, 'Cancer Council Victoria')) = {'Cancer Council VIC'};
D.Organisation(strcmpi(D.Organisation, 'Murdoch Children''s Research Institute')) = {'Murdoch Childrens Research Institute'};
D.Organisation(strcmpi(D.Organisation, 'Centenary Institute of Cancer Medicine and Cell Biology')) = {'Centenary Institute'};
D.Organisation(strcmpi(D.Organisation, 'St Vincent''s Institute of Medical Research')) = {'St Vincents Institute of Medical Research'};
D.Organisation(strcmpi(D.Organisation, 'Torrens University Australia Limited')) = {'Torrens University Australia Ltd'};
D.Organisation(strcmpi(D.Organisation, 'University of Western Australia (Kimberley Aboriginal Medical Services Limited)')) = {'Kimberley Aboriginal Medical Services Limited'};
D.Organisation(strcmpi(D.Organisation, 'Western Sydney University')) = {'University of Western Sydney'};
D.Organisation(strcmpi(D.Organisation, 'University Of New South Wales')) = {'University of New South Wales'};

D.Organisation = regexprep(D.Organisation, '^The\s+', '');

D.Scheme(cellfun(@(o) isempty(o), D.Scheme)) = {'Unknown'};
D.Scheme(strcmpi(D.Scheme, '2017 Lifting Clinical Trials and Registries Capacity - Clinical Trials Networks Program')) = {'2017 Lifting Clinical Trials and Registries Capacity'};
D.Scheme(strcmpi(D.Scheme, '2018 Keeping Australians Out of Hospital - Preventative Health Research in Rural and Regional Communities (Tasmania)')) = {'2018 Keeping Australians Out of Hospital'};
D.Scheme(strcmpi(D.Scheme, '2019 Targeted Health System and Community Organisation Research(Round 3)')) = {'2019 Targeted Health System and Community Organisation Research (Round 3)'};
D.Scheme(strcmpi(D.Scheme, '2020 Clinician Researchers: Applied Research In Health')) = {'2020 Clinician Researchers: Applied Research in Health'};
D.Scheme(strcmpi(D.Scheme, '2020 Rapid Applied ResearchTranslation')) = {'2020 Rapid Applied Research Translation'};
D.Scheme(strcmpi(D.Scheme, '2020 Stem Cell Therapies')) = {'2020 Stem Cell Therapies Mission'};
D.Scheme(strcmpi(D.Scheme, '2020 Traumatic Brain Injury')) = {'2020 Traumatic Brain Injury Mission'};
D.Scheme(strcmpi(D.Scheme, '2022 Frontier Health and Medical Research(Batch Two)')) = {'2022 Frontier Health and Medical Research (Batch Two)'};
D.Scheme(strcmpi(D.Scheme, 'Dora Lush Basic Science Research')) = {'Dora Lush Basic Science Research Scholarship'};
D.Scheme(strcmpi(D.Scheme, 'Leadership 1 (L1)')) = {'Leadership 1'};
D.Scheme(strcmpi(D.Scheme, 'Leadership 2 (L2)')) = {'Leadership 2'};
D.Scheme(strcmpi(D.Scheme, 'Leadership 3 (L3)')) = {'Leadership 3'};
D.Scheme(strcmpi(D.Scheme, 'Emerging Leadership 1 (EL1)')) = {'Emerging Leadership 1'};
D.Scheme(strcmpi(D.Scheme, 'Emerging Leadership 2 (EL2)')) = {'Emerging Leadership 2'};
D.Scheme(strcmpi(D.Scheme, 'Equipment Grants')) = {'Equipment Grant'};
D.Scheme(strcmpi(D.Scheme, 'NHMRC e-ASIA 2021 Joint Research Program')) = {'NHMRC e-ASIA Joint Research Program'};
D.Scheme(strcmpi(D.Scheme, 'National Network for Aboriginal and Torres Strait Islander health researchers seed funding')) = {'National Network for Aboriginal and Torres Strait Islander health researchers'};
D.Scheme(strcmpi(D.Scheme, 'Public Health and Health Services Research')) = {'Public Health and Health Services Research Scholarship'};
D.Scheme(strcmpi(D.Scheme, 'Research Fellowship - 6th Year Extension')) = {'Research Fellowship 6th Year Extension'};

%%

documents = tokenizedDocument(lower(D.Summary));
documents = erasePunctuation(documents);
documents = removeStopWords(documents);
documents = removeShortWords(documents, 2);

bag = bagOfWords(documents);

K = table();
K.Words = bag.Vocabulary';

%%

writetable(K, 'all-words.csv')
writetable(D, 'dataset.csv')
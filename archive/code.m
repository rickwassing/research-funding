cd('/Users/rickwassing/Documents/Work/asa-res-comm/funding-analysis')

tmp = readtable('./archive/arc.csv', 'DatetimeType','text');
ARC = table();
ARC.ID = tmp.code;
ARC.Funding_body = repmat({'ARC'}, size(tmp, 1), 1);
ARC.Scheme = tmp.scheme_name;
ARC.Organisation = tmp.announcement_admin_organisation;
ARC.Investigators = tmp.investigators;
ARC.Date = arrayfun(@(y) ['01/01/', num2str(y)], tmp.funding_commencement_year, 'UniformOutput', false);
ARC.Funding = tmp.current_funding_amount;
ARC.Summary = tmp.grant_summary;

tmp = readtable('./archive/mrff.csv', 'DatetimeType','text');
for i = 1:size(tmp)
    if strcmpi(tmp.ChiefInvestigatorTeam{i}, 'not applicable')
        tmp.ChiefInvestigatorTeam{i} = tmp.ChiefInvestigatorA_ProjectLead{i};
    end
end
tmp.ChiefInvestigatorTeam = strrep(tmp.ChiefInvestigatorTeam, ',', ';');
MRFF = table();
MRFF.ID = tmp.GrantID;
MRFF.Funding_body = repmat({'MRFF'}, size(tmp, 1), 1);
MRFF.Scheme = tmp.MRFFInitiative;
MRFF.Organisation = tmp.Organisation;
MRFF.Investigators = tmp.ChiefInvestigatorTeam;
MRFF.Date = tmp.ContractStartDate;
MRFF.Funding = tmp.TotalGrantValue;
MRFF.Summary = tmp.ProjectSummary;

tmp = readtable('./archive/nhmrc.csv', 'DatetimeType','text', 'ReadVariableNames', true);
tmp.ApplicationID = arrayfun(@(id) ['APP', num2str(id)], tmp.ApplicationID, 'UniformOutput', false);
NHMRC = table();
NHMRC.ID = tmp.ApplicationID;
NHMRC.Funding_body = repmat({'NHMRC'}, size(tmp, 1), 1);
NHMRC.Scheme = tmp.FundingScheme;
NHMRC.Organisation = tmp.AdministeringInstitution;
NHMRC.Investigators = tmp.ChiefInvestigatorTeam;
NHMRC.Date = tmp.GrantStartDate;
NHMRC.Funding = tmp.TotalAmountAwarded;
NHMRC.Summary = tmp.PlainDescription;

D = [ARC; MRFF; NHMRC];

D.Date = datetime(D.Date);

[~, idx] = sort(D.Date);
D = D(idx, :);

[~, idx] = sort(D.Funding_body);
D = D(idx, :);

%% Data cleaning

D.Funding(isnan(D.Funding)) = 0;

D.Organisation(cellfun(@(o) isempty(o), D.Organisation)) = {'Unknown'};
D.Organisation(strcmpi(D.Organisation, 'Centre For Eye Research Australia Limited')) = {'Centre for Eye Research Australia'};
D.Organisation(strcmpi(D.Organisation, 'Centre for Eye Research Australia')) = {'Centre for Eye Research Australia'};
D.Organisation(strcmpi(D.Organisation, 'Bionics Institute of Australia')) = {'Bionics Institute'};
D.Organisation(strcmpi(D.Organisation, 'Batchelor institute of Indigenous Tertiary Education')) = {'Batchelor Institute of Indigenous Tertiary Education'};
D.Organisation(strcmpi(D.Organisation, 'Adelaide University')) = {'The University of Adelaide'};
D.Organisation(strcmpi(D.Organisation, 'Heart Research Institute Ltd')) = {'Heart Research Institute'};
D.Organisation(strcmpi(D.Organisation, 'South Australian Health and Medical Research Institute Limited')) = {'South Australian Health and Medical Research Institute'};
D.Organisation(strcmpi(D.Organisation, 'Bond University Limited')) = {'Bond University'};
D.Organisation(strcmpi(D.Organisation, 'Cancer Council Victoria')) = {'Cancer Council VIC'};
D.Organisation(strcmpi(D.Organisation, 'Murdoch Children''s Research Institute')) = {'Murdoch Childrens Research Institute'};
D.Organisation(strcmpi(D.Organisation, 'Centenary Institute of Cancer Medicine and Cell Biology')) = {'Centenary Institute'};
D.Organisation(strcmpi(D.Organisation, 'St Vincent''s Institute of Medical Research')) = {'St Vincents Institute of Medical Research'};
D.Organisation(strcmpi(D.Organisation, 'Torrens University Australia')) = {'Torrens University Australia Ltd'};
D.Organisation(strcmpi(D.Organisation, 'Torrens University Australia Limited')) = {'Torrens University Australia Ltd'};
D.Organisation(strcmpi(D.Organisation, 'University of Western Australia (Kimberley Aboriginal Medical Services Limited)')) = {'Kimberley Aboriginal Medical Services Limited'};
D.Organisation(strcmpi(D.Organisation, 'Western Sydney University')) = {'University of Western Sydney'};
D.Organisation(strcmpi(D.Organisation, 'University Of New South Wales')) = {'University of New South Wales'};

D.Organisation = regexprep(D.Organisation, '^The\s+', '');

D.Scheme(cellfun(@(o) isempty(o), D.Scheme)) = {'Unknown'};

D.Scheme(strcmpi(D.Scheme, 'Clinical Trials and Cohort Studies Grants')) = {'Clinical Trials and Cohort Studies'};
D.Scheme(strcmpi(D.Scheme, 'Research Fellowships')) = {'Research Fellowship'};
D.Scheme(strcmpi(D.Scheme, 'Targeted Call for Research')) = {'Targeted Call for Research'};
D.Scheme(strcmpi(D.Scheme, 'Targeted Research')) = {'Targeted Call for Research'};
D.Scheme(strcmpi(D.Scheme, 'Targeted Calls for Research')) = {'Targeted Call for Research'};

D.Scheme = cellfun(@(a,b) [a, ' ', b], D.Funding_body, D.Scheme, 'UniformOutput', false);


%% Remove equipment grants and researhc infrastructure grants
idx = find(ismember(D.Summary, {'0', 'Not Applicable', 'Not Available', 'Not applicable'}));
unique(D.Scheme(idx))
D(idx, :) = [];

%%

writetable(D, 'dataset.csv')
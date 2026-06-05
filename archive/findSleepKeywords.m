function results = findSleepKeywords(csvFile)

% FINDS WORDS THAT OCCUR IN AT LEAST ONE SLEEP-RELATED SUMMARY
% AND IN NO NON-SLEEP-RELATED SUMMARIES.
%
% Also evaluates whether the resulting keyword set correctly identifies
% all sleep-related summaries and no non-sleep-related summaries.
%
% Usage:
%   results = findSleepOnlyWords('grant_summaries.csv');

% Load data

T = readtable(csvFile,'TextType','string');

requiredCols = ["Summary","Manual_Sleep_Topic"];

if ~all(ismember(requiredCols,T.Properties.VariableNames))
    error('CSV must contain columns: Summary and is_sleep_related');
end

summaries = lower(string(T.Summary));
labels = lower(string(T.Manual_Sleep_Topic));

isSleep = labels == "yes";

% ------------------------------------------------------------------------
% Build word dictionaries
% ------------------------------------------------------------------------

sleepWords = containers.Map();
nonSleepWords = containers.Map();

% Sleep summaries
for i = find(isSleep)'

    txt = summaries(i);

    txt = regexprep(txt,'[^a-z0-9 ]',' ');
    txt = regexprep(txt,'\s+',' ');
    txt = strtrim(txt);

    words = unique(split(txt));
    words(words=="") = [];

    for j = 1:numel(words)

        w = char(words(j));

        if isKey(sleepWords,w)
            sleepWords(w) = sleepWords(w) + 1;
        else
            sleepWords(w) = 1;
        end
    end
end

% Non-sleep summaries
for i = find(~isSleep)'

    txt = summaries(i);

    txt = regexprep(txt,'[^a-z0-9 ]',' ');
    txt = regexprep(txt,'\s+',' ');
    txt = strtrim(txt);

    words = unique(split(txt));
    words(words=="") = [];

    for j = 1:numel(words)

        w = char(words(j));
        nonSleepWords(w) = 1;
    end
end

% ------------------------------------------------------------------------
% Find words unique to sleep summaries
% ------------------------------------------------------------------------

allSleepWords = keys(sleepWords);

keepWords = {};
counts = [];

for i = 1:numel(allSleepWords)

    w = allSleepWords{i};

    if ~isKey(nonSleepWords,w)

        keepWords{end+1} = w; %#ok<AGROW>
        counts(end+1) = sleepWords(w); %#ok<AGROW>

    end
end

[counts,idx] = sort(counts,'descend');
keepWords = keepWords(idx);

sleepOnlyWords = table( ...
    string(keepWords(:)), ...
    counts(:), ...
    'VariableNames',{'Word','SleepSummaryCount'});

% ------------------------------------------------------------------------
% Test classifier using all discovered keywords
% ------------------------------------------------------------------------

keywords = lower(string(sleepOnlyWords.Word));

nDocs = height(T);

predictedSleep = false(nDocs,1);

for i = 1:nDocs

    txt = lower(string(T.Summary(i)));

    txt = regexprep(txt,'[^a-z0-9 ]',' ');
    txt = regexprep(txt,'\s+',' ');
    txt = strtrim(txt);

    words = unique(split(txt));
    words(words=="") = [];

    predictedSleep(i) = any(ismember(words,keywords));

end

actualSleep = isSleep;

% ------------------------------------------------------------------------
% Confusion matrix
% ------------------------------------------------------------------------

TP = sum(predictedSleep & actualSleep);
TN = sum(~predictedSleep & ~actualSleep);
FP = sum(predictedSleep & ~actualSleep);
FN = sum(~predictedSleep & actualSleep);

fprintf('\n========================================\n');
fprintf('CLASSIFICATION RESULTS\n');
fprintf('========================================\n');

fprintf('Sleep summaries     : %d\n',sum(actualSleep));
fprintf('Non-sleep summaries : %d\n\n',sum(~actualSleep));

fprintf('True positives  : %d\n',TP);
fprintf('True negatives  : %d\n',TN);
fprintf('False positives : %d\n',FP);
fprintf('False negatives : %d\n\n',FN);

if (TP+FN) > 0
    fprintf('Sensitivity : %.4f\n',TP/(TP+FN));
end

if (TN+FP) > 0
    fprintf('Specificity : %.4f\n',TN/(TN+FP));
end

% ------------------------------------------------------------------------
% Show discovered keywords
% ------------------------------------------------------------------------

fprintf('\n========================================\n');
fprintf('DISCOVERED KEYWORDS\n');
fprintf('========================================\n');

disp(sleepOnlyWords)

% ------------------------------------------------------------------------
% False negatives
% ------------------------------------------------------------------------

missedSleep = find(actualSleep & ~predictedSleep);

fprintf('\n========================================\n');
fprintf('MISSED SLEEP SUMMARIES (FALSE NEGATIVES)\n');
fprintf('========================================\n');

if isempty(missedSleep)

    fprintf('None.\n');

else

    for i = missedSleep'

        fprintf('\nRecord %d\n',i);
        fprintf('%s\n',T.Summary{i});

    end
end

% ------------------------------------------------------------------------
% False positives
% ------------------------------------------------------------------------

falsePositives = find(~actualSleep & predictedSleep);

fprintf('\n========================================\n');
fprintf('FALSE POSITIVES\n');
fprintf('========================================\n');

if isempty(falsePositives)

    fprintf('None.\n');

else

    for i = falsePositives'

        fprintf('\nRecord %d\n',i);
        fprintf('%s\n',T.Summary{i});

    end
end

% ------------------------------------------------------------------------
% Return results
% ------------------------------------------------------------------------

results = struct();

results.sleepOnlyWords = sleepOnlyWords;
results.keywords = keywords;

results.TP = TP;
results.TN = TN;
results.FP = FP;
results.FN = FN;

results.sensitivity = TP/(TP+FN);
results.specificity = TN/(TN+FP);

results.missedSleepRows = missedSleep;
results.falsePositiveRows = falsePositives;

end
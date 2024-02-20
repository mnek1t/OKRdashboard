public with sharing class KeyResultHandler {

    @AuraEnabled
    public static KeyResult__c createKeyResult(String keyResultName, String objectivityId){ //create new Record in KeyResult__c object    
        KeyResult__c keyResult = new KeyResult__c(
            Name = keyResultName,
            Objectivity__c = (Id)objectivityId
        );
        insert keyResult;
        return keyResult;
    }
    @AuraEnabled(cacheable=true)
    public static List<Map<String,String>> getKeyRecordsOptions(){ 
        List<Map<String,String>> keyRecordsOptions = new List<Map<String,String>>();
        for(KeyResult__c keyRecord :[SELECT Id, Name FROM KeyResult__c]){
            Map<String,String> option = new Map<String,String>{
                'label'=> keyRecord.Name,
                'value' => (String)keyRecord.Id
            };
            keyRecordsOptions.add(option);
            System.debug(option);
        }
        return keyRecordsOptions;
    }
    @AuraEnabled(cacheable = true)
    public static List<KeyResult__c> getKeyResults(Id keyResultId, String contractType){ 
            return [SELECT Name, Progress__c,
            (SELECT Name FROM Opportunities__r),
            (SELECT WhatId FROM Events),
            (SELECT Name FROM Calls__r),
            (SELECT Name FROM Leads__r WHERE LeadSource = 'Web'),
            (SELECT Name FROM Acts__r),
            (SELECT Name FROM Google_Reviews__r),
            (SELECT Name FROM Reviews__r),
            (SELECT Name FROM Surveys__r),
            (SELECT Name FROM Case_Studies__r),
            (SELECT Id FROM Contracts__r WHERE Type__c =: contractType)
            FROM KeyResult__c WHERE Id =:keyResultId];
    }
    private static List<KeyResult__c> keyResultsToUpdate = new List<KeyResult__c>();

    @AuraEnabled(cacheable=true) // update Progress__c field for keyResult
    public static List<KeyResult__c> updateKeyResultProgress(Integer sumOfTargets,List<KeyResult__c> keyResults, Integer sumofCompletedTargets){
        List<AggregateResult> results = [SELECT COUNT(Id) FROM KeyResult__c];
        for(KeyResult__c k: keyResults)
        {
            if(sumofCompletedTargets < sumOfTargets/2 || sumOfTargets==0 )
                k.Progress__c = 'In progress';
            else if(sumofCompletedTargets >= sumOfTargets/2 && sumofCompletedTargets < sumOfTargets)
                k.Progress__c = 'Halfway through';
            else k.Progress__c = 'Finished';
            keyResultsToUpdate.add(k);
        } 
        if (!results.isEmpty()) {
            Integer countValue = Integer.valueOf(results[0].get('expr0'));
            if(keyResultsToUpdate.size() == 3)
            {
                update keyResultsToUpdate;
            }
        }
        System.debug(keyResultsToUpdate);
        return keyResultsToUpdate;
    }   
    @AuraEnabled
    public static void createReview(String reviewName, Id keyResultId){ // create Review__c as a related field in KeyResult__c
        Review__c review = new Review__c(
            Name = reviewName,
            Key_Result__c = keyResultId
        );
        insert review;
    }
    @AuraEnabled
    public static void createGoogleReview(String googleReviewName, Id keyResultId){ // create GoogleReview__c as a related field in KeyResult__c
        Google_Review__c googleReview = new Google_Review__c(
            Name = googleReviewName,
            Key_Result__c = keyResultId
        );
        insert googleReview;
    }
    @AuraEnabled
    public static void createSurvey(String surveyName, Id keyResultId){ // create GoogleReview__c as a related field in KeyResult__c
        Survey__c survey = new Survey__c(
            Name = surveyName,
            Key_Result__c = keyResultId
        );
        insert survey;
    }
    @AuraEnabled
    public static void createCaseStudy(String caseStudyName, Id keyResultId){ // create GoogleReview__c as a related field in KeyResult__c
        Case_Study__c caseStudy = new Case_Study__c(
            Name = caseStudyName,
            Key_Result__c = keyResultId
        );
        insert caseStudy;
    }
    public static void deleteKeyResult(Id keyResult){
        delete [SELECT Id FROM KeyResult__c WHERE Id =: keyResult];
    }
    public static void deleteKeyResults(List<KeyResult__c> keyResults){
        delete keyResults;
    }
}
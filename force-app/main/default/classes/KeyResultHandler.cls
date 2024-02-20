public with sharing class KeyResultHandler {
    //create new Record in KeyResult__c object
    @AuraEnabled
    public static KeyResult__c createKeyResult(String keyResultName, String objectivityId){     
        KeyResult__c keyResult = new KeyResult__c(
            Name = keyResultName,
            Objectivity__c = (Id)objectivityId
        );
        insert keyResult;
        return keyResult;
    }
    //get collection of keys(Key Result Name) and values(Key Result Id)
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
    //get all Key Results with all related objects
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
    //create new Review__c  
    @AuraEnabled
    public static void createReview(String reviewName, Id keyResultId){
        Review__c review = new Review__c(
            Name = reviewName,
            Key_Result__c = keyResultId
        );
        insert review;
    }
    //create new GoogleReview__c
    @AuraEnabled
    public static void createGoogleReview(String googleReviewName, Id keyResultId){
        Google_Review__c googleReview = new Google_Review__c(
            Name = googleReviewName,
            Key_Result__c = keyResultId
        );
        insert googleReview;
    }
    //create new Survey__c
    @AuraEnabled
    public static void createSurvey(String surveyName, Id keyResultId){
        Survey__c survey = new Survey__c(
            Name = surveyName,
            Key_Result__c = keyResultId
        );
        insert survey;
    }
    //create new Case_Study__c
    @AuraEnabled
    public static void createCaseStudy(String caseStudyName, Id keyResultId){
        Case_Study__c caseStudy = new Case_Study__c(
            Name = caseStudyName,
            Key_Result__c = keyResultId
        );
        insert caseStudy;
    }
    //delete operations
    public static void deleteKeyResult(Id keyResult){
        delete [SELECT Id FROM KeyResult__c WHERE Id =: keyResult];
    }
    public static void deleteKeyResults(List<KeyResult__c> keyResults){
        delete keyResults;
    }
}
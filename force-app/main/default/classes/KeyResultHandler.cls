public with sharing class KeyResultHandler {
    @AuraEnabled
    public static KeyResult__c createKeyResult(String keyResultName, Id objectivityId){
        //Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.KeyResult__c.fields.getMap();
        
        KeyResult__c keyResult = new KeyResult__c(
            Name = keyResultName,
            Objectivity__c = objectivityId
        );
        // for (String relatedField : trackfields) {
        //     if(fieldMap.containsKey(relatedField)){
        //         keyResult.put(relatedField,relatedField);
        //     }
        // }
        insert keyResult;
        return keyResult;
    }
    @AuraEnabled
    public static List<Map<String,String>> getKeyRecords(){
        List<Map<String,String>> keyRecordsOptions = new List<Map<String,String>>();
        for(Objective__c keyRecord :[SELECT Id, Name FROM Objective__c]){
            Map<String,String> option = new Map<String,String>{
                'label'=> keyRecord.Name,
                'value' => (String)keyRecord.Id
            };
            keyRecordsOptions.add(option);
            System.debug(option);
        }
        return keyRecordsOptions;
    }
    @AuraEnabled
    public static List<KeyResult__c> getKeyResults(Id keyResultId){
        return [SELECT Name, Progress__c,
        (SELECT Name FROM Opportunities__r),
        (SELECT WhatId FROM Events),
        (SELECT Name FROM Calls__r),
        (SELECT Name FROM Leads__r WHERE LeadSource = 'Web'),
        (SELECT Name FROM Acts__r),
        (SELECT Name FROM Google_Reviews__r),
        (SELECT Name FROM Reviews__r),
        (SELECT Name FROM Surveys__r),
        (SELECT Name FROM Case_Studies__r)
         FROM KeyResult__c WHERE Id =:keyResultId];
    }
    @AuraEnabled
    public static void createReview(String reviewName, Id keyResultId){
        Review__c review = new Review__c(
            Name = reviewName,
            Key_Result__c = keyResultId
        );
        insert review;
        //return review;
        
    }
}
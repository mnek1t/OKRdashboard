public with sharing class KeyResultHandler {
    @AuraEnabled
    public static KeyResult__c createKeyResult(String keyResultName, Id objectivityId){
        //Objective__c lookUp = [SELECT Id FROM Objective__c WHERE Id=:objectivityId LIMIT 1];
        KeyResult__c keyResult = new KeyResult__c(
            Name = keyResultName,
            Objectivity__c = objectivityId
        );
        insert keyResult;
        return keyResult;
    }
    @AuraEnabled
    public static List<KeyResult__c> getKeyResults(Id objectivityId){
        return [SELECT Name FROM KeyResult__c WHERE Objectivity__c =:objectivityId];
    }
    // @AuraEnabled
    // public static List<Map<String, String>> getRelatedFieldsOptions(){
    //     List<Map<String, String>> relatedFieldsOptions = new List<Map<String, String>>();
    //     //TODO create realted fields and get it
    //     List<KeyResult__c> keyResult =[SELECT Id, Name,
    //             (SELECT Id, Name FROM Opportunity),
    //             (SELECT Id, Name FROM Call__c),
    //             (SELECT Id, Name FROM Review__c),
    //             (SELECT Id, Name FROM Google_Review__c),
    //             (SELECT Id, Name FROM Act__c),
    //             (SELECT Id, Name FROM Survey__c),
    //             (SELECT Id, Name FROM Case_Study__c),
    //             (SELECT Id, Name FROM Event)
    //             // Add more subqueries for other related objects
    //         FROM KeyResult__c
    //     ];
    // }
}
public with sharing class KeyResultHandler {
    @AuraEnabled
    public static KeyResult__c createKeyResult(String keyResultName, Id objectivityId, List<String> trackfields){
        //Objective__c lookUp = [SELECT Id FROM Objective__c WHERE Id=:objectivityId LIMIT 1];
        Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.KeyResult__c.fields.getMap();
        
        KeyResult__c keyResult = new KeyResult__c(
            Name = keyResultName,
            Objectivity__c = objectivityId
        );
        for (String relatedField : trackfields) {
            if(fieldMap.containsKey(relatedField)){
                keyResult.put(relatedField,relatedField);
            }
        }
        insert keyResult;
        return keyResult;
    }
    @AuraEnabled
    public static List<KeyResult__c> getKeyResults(Id keyResultId){
        return [SELECT Name, Progress__c,(SELECT Name FROM Opportunities__r) FROM KeyResult__c WHERE Id =:keyResultId];
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
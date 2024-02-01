public with sharing class ContractsHandler {
    @AuraEnabled
    public static List<String> getContractTypes(){
        List<String> options = new List<String>();
        Schema.DescribeFieldResult type = Contract.Type__c.getDescribe();
        List<Schema.PicklistEntry> picklistValues = type.getPicklistValues();
        for(Schema.PicklistEntry picklistValue : picklistValues){
            options.add(picklistValue.getLabel());
        }
        return options;
    }   
}
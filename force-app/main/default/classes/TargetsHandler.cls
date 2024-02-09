public with sharing class TargetsHandler {
    @AuraEnabled
    public static void saveTargets(String targets, String amount, String keyResultId, String contractType){
        try {
            TargetSelection__c target = new TargetSelection__c();
            target.Key_Result__c = (Id)keyResultId;
            target.Targets__c = targets;
            target.AmountTargets__c = amount;
            target.ContractTypes__c = contractType;
            insert target;
        } catch (Exception e ) {
            System.debug(e.getMessage());
        }
    }
    @AuraEnabled
    public static List<TargetSelection__c> getTargets(id keyResultId){
        return [SELECT Targets__c, AmountTargets__c, ContractTypes__c  FROM TargetSelection__c WHERE Key_Result__c =: keyResultId LIMIT 1];
    }
}
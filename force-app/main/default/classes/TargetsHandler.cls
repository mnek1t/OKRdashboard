public with sharing class TargetsHandler {
    @AuraEnabled
    public static List<Target__c> getTargets(id keyResultId){
        return [SELECT Name,ToAchieve__c, Completed__c, ContractType__c FROM Target__c WHERE Key_Result__c =: keyResultId ];
    }
    @AuraEnabled
    public static void setTarget(List<String> targets, List<String> amount,List<String> completedTarget , String keyResultId, String contractType){
        List<Target__c> targetsToInsert = new List<Target__c>();
        for (Integer i = 0; i < targets.size(); i++) {
            Target__c targetObject = new Target__c( 
                Key_Result__c = (Id)keyResultId,
                Name = targets[i],
                ToAchieve__c = Integer.valueOf(amount[i]),
                Completed__c = Integer.valueOf(completedTarget[i])
            );
            if(targetObject.Name == 'Contract')
            {
                List<AggregateResult> contracts = [SELECT COUNT(Id) cnt FROM Contract WHERE Key_Result__c = :keyResultId AND Type__c =:contractType];
                if (!contracts.isEmpty()) {
                    targetObject.Completed__c = (Integer.valueOf(contracts[0].get('cnt')));
                }
                targetObject.ContractType__c = contractType;
            }
            targetsToInsert.add(targetObject);
        }
        insert targetsToInsert;
    }
}
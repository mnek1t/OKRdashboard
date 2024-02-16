trigger ContractUpdateTargets on Contract (after insert, after delete, after undelete, after update) {
    String contractType = '';
    Set<Id> targetsId = new Set<Id>();
    //from inserted Contract, add its KeyResult__c (Id) to collection of ids
    if (Trigger.isInsert || Trigger.isUndelete || Trigger.isUpdate || Trigger.isUpdate) {
        for (Contract contract : Trigger.new) {
            targetsId.add(contract.Key_Result__c); // ex. get some a01Wy000002Bt4rIAC..
            contractType = contract.Type__c;
        }
    }
    //the same logic but for deletion
    if (Trigger.isDelete) {
        for (Contract contract : Trigger.old) {
            targetsId.add(contract.Key_Result__c);
            contractType = contract.Type__c;
        }
    }
    //loop in obtained collection of ids
    List<Target__c> targets = new List<Target__c>();
    for (Id targetId : targetsId) {
        if(contractType!= '')
        {
            List<Target__c> targetList = [SELECT Id, Completed__c FROM Target__c WHERE Key_Result__c = :targetId AND Name = 'Contract' AND ContractType__c =:contractType];
            if (!targetList.isEmpty()) {
                Target__c target = targetList[0];
                target.Completed__c = [SELECT COUNT() FROM Contract WHERE Key_Result__c = :targetId];
                targets.add(target);
            }
        }
    }
    update targets;
}

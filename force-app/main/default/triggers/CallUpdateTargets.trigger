trigger CallUpdateTargets on Call__c (after insert, after delete, after undelete, after update) {
    Set<Id> targetsId = new Set<Id>();
    //from inserted Call__c, add its KeyResult__c (Id) to collection of ids
    if (Trigger.isInsert || Trigger.isUndelete || Trigger.isUpdate) {
        for (Call__c call : Trigger.new) {
            targetsId.add(call.Key_Result__c); // ex. get some a01Wy000002Bt4rIAC..
        }
    }
    //the same logic but for deletion
    if (Trigger.isDelete) {
        for (Call__c call : Trigger.old) {
            targetsId.add(call.Key_Result__c);
        }
    }
    //loop in obtained collection of ids
    List<Target__c> targets = new List<Target__c>();
    for (Id targetId : targetsId) {
        Target__c target = [SELECT Id, Completed__c FROM Target__c WHERE Key_Result__c = :targetId AND Name = 'Call'];
        target.Completed__c = [SELECT COUNT() FROM Call__c WHERE Key_Result__c = :targetId];
        targets.add(target);
    }
    update targets;
}
trigger OpportunityUpdateTargets on Opportunity (after insert, after delete, after undelete, after update) {
    Set<Id> targetsId = new Set<Id>();
    //from inserted Opportunity, add its KeyResult__c (Id) to collection of ids
    if (Trigger.isInsert || Trigger.isUndelete || Trigger.isUpdate) {
        for (Opportunity opportunity : Trigger.new) {
            targetsId.add(opportunity.Key_Result__c); // ex. get some a01Wy000002Bt4rIAC..
        }
    }
    //the same logic but for deletion
    if (Trigger.isDelete) {
        for (Opportunity opportunity : Trigger.old) {
            targetsId.add(opportunity.Key_Result__c);
        }
    }
    //loop in obtained collection of ids
    List<Target__c> targets = new List<Target__c>();
    for (Id targetId : targetsId) {
        Target__c target = [SELECT Id, Completed__c FROM Target__c WHERE Key_Result__c = :targetId AND Name = 'Opportunity'];
        target.Completed__c = [SELECT COUNT() FROM Opportunity WHERE Key_Result__c = :targetId];
        targets.add(target);
    }
    update targets;
}
trigger WebLeadUpdateTargets on Lead (after insert, after delete, after undelete, after update) {
    Set<Id> targetsId = new Set<Id>();
    //from inserted Lead, add its KeyResult__c (Id) to collection of ids
    if (Trigger.isInsert || Trigger.isUndelete || Trigger.isUpdate) {
        for (Lead lead : Trigger.new) {
            targetsId.add(lead.Key_Result__c); // ex. get some a01Wy000002Bt4rIAC..
        }
    }
    //the same logic but for deletion
    if (Trigger.isDelete) {
        for (Lead lead : Trigger.old) {
            targetsId.add(lead.Key_Result__c);
        }
    }
    //loop in obtained collection of ids
    List<Target__c> targets = new List<Target__c>();
    for (Id targetId : targetsId) {
        Target__c target = [SELECT Id, Completed__c FROM Target__c WHERE Key_Result__c = :targetId AND Name = 'Leads (Web)'];
        List<AggregateResult> results = [SELECT COUNT(Id) cnt FROM Lead WHERE Key_Result__c = :targetId AND LeadSource = 'Web'];
        if (!results.isEmpty()) {
            target.Completed__c = (Integer.valueOf(results[0].get('cnt')));
        }
        targets.add(target);
    }
    update targets;
}

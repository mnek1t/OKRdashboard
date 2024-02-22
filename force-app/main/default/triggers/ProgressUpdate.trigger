trigger ProgressUpdate on Target__c (after update) {
    List<KeyResult__c> keyResults = new List<KeyResult__c>();
    for(Target__c target: Trigger.new)
    {
        Target__c oldTarget = Trigger.oldMap.get(target.Id);
        if(target.Completed__c != oldTarget.Completed__c)
        {
            List<KeyResult__c> keyResultList = [SELECT Id FROM KeyResult__c WHERE Id =: target.Key_Result__c];
            if(!keyResultList.isEmpty())
            {
                KeyResult__c keyResult = keyResultList[0]; 
                List<AggregateResult> resultSumToAchieve = [SELECT SUM(ToAchieve__c) overall FROM Target__c WHERE Key_Result__c =: keyResult.Id];
                List<Target__c> ToAchieveWithCompleted = [SELECT ToAchieve__c, Completed__c FROM Target__c WHERE Key_Result__c =: keyResult.Id];
                if(!resultSumToAchieve.isEmpty() && !ToAchieveWithCompleted.isEmpty())
                {
                    Integer amountTargetsToAchieve = Integer.valueOf(resultSumToAchieve[0].get('overall'));
                    Integer sumOfCompletedTargets = 0;
                    for (Target__c item : ToAchieveWithCompleted) {
                        if(item.Completed__c> item.ToAchieve__c)
                        {
                            item.Completed__c = item.ToAchieve__c;
                        }
                        sumOfCompletedTargets = sumOfCompletedTargets +  Integer.valueOf(item.Completed__c);
                    }
                    if(sumOfCompletedTargets < amountTargetsToAchieve/2 || amountTargetsToAchieve==0 )
                         keyResult.Progress__c = 'In progress';
                    else if(sumOfCompletedTargets >= amountTargetsToAchieve/2 && sumOfCompletedTargets < amountTargetsToAchieve)
                        keyResult.Progress__c = 'Halfway through';
                    else keyResult.Progress__c = 'Finished';
                    keyResults.add(keyResult);
                }
                //List<AggregateResult> resultToAchieve = [SELECT SUM(ToAchieve__c) overall FROM Target__c WHERE Key_Result__c =: keyResult.Id];
                // List<AggregateResult> resultCompleted = [SELECT SUM(Completed__c) overall FROM Target__c WHERE Key_Result__c =: keyResult.Id];
                // if(!resultToAchieve.isEmpty() && !resultCompleted.isEmpty())
                // {
                //     Integer amountTargetsToAchieve = Integer.valueOf(resultToAchieve[0].get('overall'));
                //     //List<AggregateResult> substractOverDone = [SELECT SUM(Completed__c) overall FROM Target__c WHERE Key_Result__c =: keyResult.Id AND Completed__c < :amountTargetsToAchieve];
                //     Integer amountCompletedTargets = Integer.valueOf(resultCompleted[0].get('overall'));
                //     if(amountCompletedTargets < amountTargetsToAchieve/2 || amountTargetsToAchieve==0 )
                //         keyResult.Progress__c = 'In progress';
                //     else if(amountCompletedTargets >= amountTargetsToAchieve/2 && amountCompletedTargets < amountTargetsToAchieve)
                //         keyResult.Progress__c = 'Halfway through';
                //     else keyResult.Progress__c = 'Finished';
                //     keyResults.add(keyResult);
                // }
            }
        }
    }
    update keyResults;
}
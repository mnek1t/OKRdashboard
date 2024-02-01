trigger ObjectivityHandlerTrigger on Objective__c (before insert) 
{
    List <Objective__c> objectivities = Trigger.new;
    List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();
    for(Objective__c objectivity : objectivities ){
        Date startDate = objectivity.Start_Date__c;
        Date endDate = objectivity.End_Date__c;
        Integer daysBetween = startDate.daysBetween(endDate);
        if(daysBetween<0){
            objectivity.addError('Choose correct dates');
        }
        if(String.isBlank(objectivity.Name)){
            objectivity.Name.addError('Specify the name of objectivity');
        }
        if(String.isBlank(objectivity.Owner__c)){
            objectivity.Owner__c.addError('Specify the name of objectivity');
        }
        System.debug(objectivity.Owner__c);
        User u = [SELECT Email FROM User WHERE Id = :objectivity.Owner__c];
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new String[] {u.Email});
        mail.setSubject('New objectivity!');
        mail.setPlainTextBody('You have an objectivity assigned! Check the OKR dashboard');
        mails.add(mail);
    }
    Messaging.sendEmail(mails);
}
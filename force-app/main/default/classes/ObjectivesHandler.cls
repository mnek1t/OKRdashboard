public with sharing class ObjectivesHandler 
{
    //create new Objective__c
    @AuraEnabled
    public static Objective__c createObjective(String objName,String description,Date startDate, Date endDate, String userIdAssigned)
    {
        Objective__c newObjectivity = new Objective__c(
            Name = objName, 
            Description__c = description,
            AssignedTo__c = (Id)userIdAssigned,
            Start_date__c = startDate,
            End_Date__c = endDate 
        );
        insert newObjectivity;
        return newObjectivity;
    }
    //get Objective__c name with Objective__c Id to provide a selection in LWC
    @AuraEnabled(cacheable=true)
    public static List<Map<String,String>> getObjectivesOptions(){
        List<Map<String,String>> objectivityOptions = new List<Map<String,String>>();
        for(Objective__c objectivity :[SELECT Id, Name FROM Objective__c]){
            Map<String,String> option = new Map<String,String>{
                'label'=> objectivity.Name,
                'value' => (String)objectivity.Id
            };
            objectivityOptions.add(option);
            System.debug(option);
        }
        return objectivityOptions;
    }
    //get Objective__c in accordance with user and year for that Objective__c was assigned for
    @AuraEnabled(cacheable=true)
    public static List<Objective__c> getObjectivesAccordingUser(String user, String year){
        List<Objective__c> objectives  = 
            [SELECT Id, Name,(SELECT Id,Name,Progress__c FROM Key_Results__r) FROM Objective__c 
            WHERE AssignedTo__c =: (Id)user AND CALENDAR_YEAR(Start_date__c) <=: Integer.valueOf(year) AND CALENDAR_YEAR(End_date__c) >=: Integer.valueOf(year)];
        return objectives;
    }
    //get all Objective__c
    @AuraEnabled(cacheable=true)
    public static List<Objective__c> getObjectivities(){
        return [SELECT Id, Name ,(SELECT Id,Name,Progress__c FROM Key_Results__r) FROM Objective__c];
    } 
    //delete operations
    public static void deleteObjective(Id objective){
        delete [SELECT Id FROM Objective__c WHERE Id =: objective];
    }
    public static void deleteObjectives(List<Objective__c> objectives){
        delete objectives;
    }
}
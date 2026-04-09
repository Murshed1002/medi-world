Current Priority Tasks:
1 - change the doctor listing page logic to contain the clinic name and address which are closet to the user address and if city filter is selected then closest to that city.
2 - create a address table , add foreign key for that address table in patients , doctors and clincs table.

3 - give user option to enter patient details on the booking page , or autofill if selected 'for self'





Future tasks: 

1 - Create a cron job that deletes all the entries from refresh_tokens table revoked or expired.
2 - Create a Specialization table for the doctors. It has to be Many to Many relationship with the doctors table
3 - In the doctor details page add functionality to select the clinic as a doctor might be present in multiple clinics.
4 - change all the tables refering to doctors and clinics tables separately,  to doctor_clinics_id refering to dcotor_clinic table.
5 - rename doctor_slot table name to doctor_availability


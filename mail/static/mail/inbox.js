document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');

  // Clear out composition fields
  recipients.value = '';
  subject.value = '';
  body.value = '';

  
  const composeForm = document.querySelector('#compose-form');
  composeForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!recipients.value.includes('@')){
      recipients.value ='';
      recipients.placeholder = "Please Enter Valid Recipients";
      console.log('error')
      return false;
    }
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients.value,
          subject: subject.value,
          body: body.value
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        //console.log(result);
        load_mailbox('inbox');

    });
  })


}




function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
 .then(response=>response.json())
 .then(emails => {
   if (emails['error'] != null ){
    console.log(emails.error)
   }
   else{
    const List = document.createElement('ul');
    List.setAttribute('class', "list-group");
    document.querySelector('#emails-view').appendChild(List);
    
    for(let email of emails){
      const listItem = document.createElement('li');
      listItem.classList.add("list-group-item","mailbox-item", email.read ? "read":"unread");    
      listItem.innerHTML = `<div class="mailbox-sender">${email.sender}</div>
      <div class="mailbox-subject">${email.subject}</div>
      <div class=" mailbox-timestamp"><small> ${email.timestamp}</small></div>`
      List.appendChild(listItem);
    }



   }
 });
}
document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () =>{
    load_mailbox('inbox');
   // history.pushState({ view: 'inbox' }, '', '/inbox');
  } );
  document.querySelector('#sent').addEventListener('click', () => {
    load_mailbox('sent');
   // history.pushState({ view: 'sent' }, '', '/sent');

  });
  document.querySelector('#archived').addEventListener('click', () => {
    load_mailbox('archive');
    //history.pushState({ view: 'archive' }, '', '/archive');
  });
  document.querySelector('#compose').addEventListener('click', ()=> {
    compose_email(null);
   // history.pushState({ view: 'compose' }, '', '/compose');
  });

  /*window.addEventListener('popstate', (event) => {
    console.log(window.history.length);
    console.log('###############')
    const state = event.state;
    if (state) {
      console.log(window.history.length);
      if (!checkAuthentication()){
        window.location.href = '/login';
      }
      else{
        if (state.view === 'compose') {
          compose_email(null); 
        } 
        else if (state.hasOwnProperty('emailID')){
          if (state.hasOwnProperty('action')){
            if (state.action === 'reply'){
              fetch(`/emails/${state.emailID}`)
                .then(response => response.json())
                .then(email => {
                  compose_email(email)})
            }
          }else{
            load_email(state.emailID,state.view)
          }
        }
        else{
          load_mailbox(state.view); 
        }
      }

   
    }
  });*/

  // By default, load the inbox
  load_mailbox('inbox');
  //history.pushState({view:'inbox'}, '', '');
});

function compose_email(email) {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#error-message' ).classList= "hidden";

  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');


  if (email === null){
    recipients.value = '';
    subject.value = '';
    body.value = '';
  }else{
    recipients.value = email.sender;
    subject.value = email.subject.startsWith("Re: ") ? email.subject : "Re: " + email.subject;
    body.value = "\nOn " + email.timestamp + " " + email.sender + " wrote: " + email.body  
  }
 

  
  const composeForm = document.querySelector('#compose-form');
  function handleFormSubmit(event) {
    console.log('handleFormSubmit')
    console.log(event)
    event.preventDefault();
    if (!recipients.value.includes('@')) {
      recipients.value = '';
      recipients.placeholder = "Please Enter Valid Recipients";
      console.log('error');
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
    .then(response => {
      console.log('Request sent');
      if (!response.ok) {
        console.log('Response not ok');
        let error_message = 'Network response was not ok'; 
        return response.json()
          .then(data => {
            if (data.error) {
              error_message = data.error;
            }
            throw new Error(error_message);
          });
      }
      return response.json();
    })
    .then(result => {
      console.log('Response received:', result);
      const successMessage = document.getElementById("success-message");
      successMessage.classList = 'show-success';
      document.querySelector('#compose-view').classList.add("fade-out");
      composeForm.removeEventListener('submit', handleFormSubmit);
      setTimeout(() => {
        document.querySelector('#compose-view').classList.remove("fade-out")
        successMessage.classList='hidden';
        load_mailbox('inbox');    
          }, 1000); 
          
        })
    .catch(error => {
      console.log(error);
      const errorMessage=document.getElementById('error-message')
      errorMessage.classList = 'show-success';
      errorMessage.textContent = error.message;
    });


  }

  // Add the event listener with the named function
  composeForm.addEventListener('submit', handleFormSubmit);
}


function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#emails-view').classList.add("fade-in");
  setTimeout(() => {
    document.querySelector('#emails-view').classList.remove("fade-in");
  }, 1000);
  document.querySelector('#email-view').style.display = 'none';
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
    List.id= "mailboxlist";
    document.querySelector('#emails-view').appendChild(List);
    for(let email of emails){
      const listItem = document.createElement('li');
      listItem.classList.add("list-group-item","mailbox-item", email.read ? "read":"unread"); 
      listItem.dataset.emailid = email.id   
      const sender = document.createElement('div');
      sender.classList.add("mailbox-sender");
      const cleanedRecipients = email.recipients.map((recipient) => recipient.split('@')[0]);
      const cleanedsender = email.sender.split('@')[0];
      sender.textContent = mailbox === 'sent' ? ('To: ' + cleanedRecipients.join(', ')) : cleanedsender;
      const subject = document.createElement('div');
      subject.classList.add("mailbox-subject");
      subject.textContent = email.subject;
      const emailtime = document.createElement('div');
      emailtime.classList.add("mailbox-timestamp");
      emailtime.innerHTML = "<small>" + email.timestamp + "</small>";

      listItem.appendChild(sender);
      listItem.appendChild(subject);
      listItem.appendChild(emailtime);

      List.appendChild(listItem);
    }
    const mailBoxList =document.querySelector("#mailboxlist")
    mailBoxList.addEventListener('click',(event)=>{
      const clickedLi = event.target.closest('li');
      if (clickedLi){
        const emailID = clickedLi.dataset.emailid
        const emailURL = `/${mailbox}/${emailID}`;
      //  history.pushState({ view: mailbox, emailID: emailID }, '', emailURL);
        load_email(emailID,mailbox);
      } 
 });
   }
 });
}


function load_email(emailid,mailbox){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

fetch(`/emails/${emailid}`)
.then(response => response.json())
.then(email => {
    emailshow(email,mailbox);
    fetch(`/emails/${emailid}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })

});

}


function emailshow(emailData,mailbox){
emailView = document.querySelector('#email-view');
emailView.innerHTML = "";
// Create email container
const emailContainer = document.createElement('div');
emailContainer.classList.add('email-container');

// Create button email container
const buttonContainer = document.createElement('div');
emailContainer.classList.add('email-buttons-container');

// Create email subject element
const emailSubject = document.createElement('div');
emailSubject.classList.add('email-subject');
emailSubject.textContent = emailData.subject;

// Create email sender element
const emailSender = document.createElement('div');
emailSender.classList.add('email-sender');
emailSender.textContent = emailData.sender;

// Create email body element
const emailBody = document.createElement('div');
emailBody.classList.add('email-body');
emailBody.innerHTML = emailData.body.replace(/\n/g, '<br>');

// Create email time element
const emailTime = document.createElement('div');
emailTime.classList.add('email-time');
emailTime.textContent = emailData.timestamp;


// Append elements to the email container
emailContainer.appendChild(buttonContainer);
emailContainer.appendChild(emailSubject);
emailContainer.appendChild(emailSender);
emailContainer.appendChild(emailBody);
emailContainer.appendChild(emailTime);

if (mailbox !== 'sent') {
  const archiveButton = document.createElement('button');
  archiveButton.classList.add('button-email','secondary');
  archiveButton.textContent = emailData.archived  ?  'Unarchive' :'Archive' ;
  buttonContainer.appendChild(archiveButton);

  archiveButton.addEventListener('click', () => {
    fetch(`/emails/${emailData.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: !emailData.archived
      })
    }).then(response=>{
      load_mailbox('inbox')
    }
    )
    })

  }

  const replyButton = document.createElement('button');
  replyButton.classList.add('button-email','secondary');
  replyButton.textContent = 'Reply' ;
  buttonContainer.appendChild(replyButton);

  replyButton.addEventListener('click', () => {
    const emailURL = `/${mailbox}/${emailData.id}/reply`;
    //history.pushState({ view: mailbox, emailID: emailData.id, action: 'reply' }, '', emailURL);
    compose_email(emailData);
  })






emailView.appendChild(emailContainer);
}


/*function checkAuthentication() {
  fetch('/check-authentication/')
    .then(response => response.json())
    .then(data => {
      if (data.authenticated) {
          return true;
      } else {
        return false;  
      }
    });
}*/
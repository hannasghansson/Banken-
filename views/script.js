// Skapar varaiabeler 
const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');
const logoutForm = document.getElementById('logout');

const formUser = document.getElementById('username');
const formPass = document.getElementById('password');
 
const regUser = document.getElementById('registerUser');
const regPass = document.getElementById('registerPass');
 
const welcomeElem = document.getElementById('welcome');
 
const secretBtn = document.getElementById('secretbtn');
const secretOutput = document.getElementById('secretoutput');

// Skapar varaiabeler 
const createAccountForm = document.getElementById('createAccount');
const createAccountName = document.getElementById('name');
const createAccountAmount = document.getElementById('amount');
const accountsArticle = document.getElementById('AllAccountsList');
const accountsList = document.getElementById('accounts');

let AllAccounts = [];
 


// Register
registerForm.addEventListener('submit', async (e) => {
 e.preventDefault();
 
 const respond = await fetch('/api/register', {
   method: 'POST',
   headers: {
     'Content-Type': 'application/json'
   },
   body: JSON.stringify({
     username: regUser.value,
     password: regPass.value
   })
 });
 const data = await respond.json();
  welcomeElem.innerText = `${data.username} Är nu registerad!`;
});
 
// Login
loginForm.addEventListener('submit', async (e) => {
 e.preventDefault();
 
 const respond = await fetch('/api/login', {
   method: 'POST',
   headers: {
     'Content-Type': 'application/json'
   },
   body: JSON.stringify({
     username: formUser.value,
     password: formPass.value
   })
 });
 const data = await respond.json();
 location.reload();
});
 
 
// Om använder är inloggad
const checkLoggedin = async () => {
 const respond = await fetch('/api/loggedin');
 const data = await respond.json();
 
 if (data.username) {
   loginForm.style.display = 'none';
   registerForm.style.display = 'none';
   welcomeElem.innerText = `Välkommen ${data.username}!`;

  } else {
   logoutForm.style.display = 'none';
   accountsArticle.style.display = 'none';
   createAccountForm.style.display = 'none';


 }
}
 
checkLoggedin();
 
// secret button 
secretBtn.addEventListener('click', async () => {
 const respond = await fetch('/api/secretdata');
  if (respond.status === 401) {
   secretOutput.innerText = 'That is a secret!';
 } else {
   const data = await respond.json();
   secretOutput.innerText = data.secret;
 }
});
 
// Logga ut
logoutForm.addEventListener('submit', async (e) => {
 e.preventDefault();
 
 await fetch('/api/logout', { method: 'POST' });
  location.reload();
});





// hämta alla Accounts ifrån server.js  
const getAllAccounts = async () => {
  const res = await fetch('/api/getAllAccounts');
  AllAccounts = await res.json();
  renderAllAccounts(AllAccounts);
  setAccountListeners();
}

getAllAccounts();

// Skriver ut konton i en lista 
const renderAllAccounts = (accounts) => {
  accountsList.innerHTML = '';
  accounts.forEach(account => {
    accountsList.innerHTML += 
    `<li>
      <p>Account name: ${account.name}</p>
      <p>Account creted: ${account.date}</p>
      <p>Amount: ${account.amount}</p>
      <p>Account number: ${account._id}</p>

      <form data-function="add" data-postid="${account._id}">
        <label for="add">Add</label>
        <input type="number" class="add" name="add">
        <button>Add amount</button>
      </form>
    
      <form data-function="reduce" data-postid="${account._id}">
        <label for="reduce">Reduce</label>
        <input type="number" class="reduce" name="reduce">
        <button>Reduce amount</button>
      </form>

      <br>
      <br>
      
      <form data-function="delete" data-postid="${account._id}">
        <button>Delete account</button>
      </form>
    </li>
    <br>`;
  });
}

// Event listeners på knappar i kontolistan
const setAccountListeners = () => {

  //Delete forms 
  const deleteForms = document.querySelectorAll('form[data-function="delete"]');
  deleteForms.forEach(form => {
    form.addEventListener('submit', onDeleteSubmit);
  });

  //Add amount forms 
  const addAmountsForms = document.querySelectorAll('[data-function="add"]');
  addAmountsForms.forEach(btn => {
    btn.addEventListener('submit', onAddSubmit);
  });


  //Reduce forms 
  const reduceAmountsForm = document.querySelectorAll('[data-function="reduce"]');
  reduceAmountsForm.forEach(btn => {
    btn.addEventListener('submit', onReduceSubmit)
  });

}


// Delete handler
const onDeleteSubmit = async (e) => {
  e.preventDefault(); // Eftersom att det är ett form
  if(confirm('Are you sure?')){
    await fetch(`/api/deleteAccount/${e.target.dataset.postid}`, {
      method: 'DELETE',
      headers: { 
        'content-type': 'application/json'
      }
    });
    //location.reload();
    getAllAccounts();
  }

}


// Add handler 

const onAddSubmit = async (e) => {
  e.preventDefault(); // Eftersom att det är ett form

  const account = AllAccounts.find(({ _id }) => _id === e.target.dataset.postid);
  const input = e.target.querySelector('.add');

  await fetch(`/api/addAmount/${e.target.dataset.postid}`, {
    method: 'PUT',
    headers: { 
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      amount: parseInt(input.value) + parseInt(account.amount),
    })
  });

  getAllAccounts();
}

// Reduce handeler 


const onReduceSubmit = async (e) => {
  e.preventDefault(); // Eftersom att det är ett form

  const account = AllAccounts.find(({ _id }) => _id === e.target.dataset.postid);
  const input = e.target.querySelector('.reduce');
  const totalReduce = parseInt(account.amount) - parseInt(input.value);

  if (totalReduce < 0 ){

    alert('Du kan inte ta ut mer pengar än du har på kontot.')
    return;

  }else{

    await fetch(`/api/reduceAmount/${e.target.dataset.postid}`, {
      method: 'PUT',
      headers: { 
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        amount: totalReduce,
      })
    });
    
  }
  getAllAccounts();
}




// Lägga till en ny account 
// Skapar knapp save och spara  
createAccountForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newAccount = {
    name: createAccountName.value,
    amount: createAccountAmount.value
  }
   await fetch('/api/createAccount', {
     method: 'POST', 

     headers: {
      'Content-Type': 'application/json' // att det är json
      },

    body: JSON.stringify(newAccount) // ändra okcså till json
 
   }) 
   getAllAccounts();
});


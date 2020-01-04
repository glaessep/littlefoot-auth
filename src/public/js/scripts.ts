/* eslint-disable @typescript-eslint/no-unused-vars */
interface AuthDefinition {
  readonly auth: { readonly token: string };
}

async function signup(): Promise<void> {
  const name = (document.getElementById('name') as HTMLInputElement).value;
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;
  const passwordConfirm = (document.getElementById('passwordConfirm') as HTMLInputElement).value;

  const data = {
    name,
    email,
    password,
    abo: 'free',
  };

  const response = await fetch('/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const result = await response.json();
    console.log(result);
  }
}

async function login(): Promise<void> {
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;

  const data = {
    email,
    password,
  };

  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const result = (await response.json()).data as AuthDefinition;
    console.log(result);

    window.location.replace(`/?auth_token=${result.auth.token}`);
    console.log(window.location.href);
  } else {
    console.log(response);
  }
}

async function remove(): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search);

  if (!urlParams.has('auth_token')) {
    console.log('No auth_token available. Abort.');
    console.log('Params: ' + urlParams.toString());
    return;
  }

  const response = await fetch('/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + urlParams.get('auth_token'),
    },
  });

  console.log(`Status: ${response.statusText} (${response.status})`);
}

export function loadContacts() {
  const data = localStorage.getItem("WALLET_CONTACTS");
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveContact(address, name, publicKey) {
  if (!address) return false;

  const contacts = loadContacts();

  // Prevent duplicates
  const exists = contacts.find((c) => c.address === address);
  if (exists) return false;

  contacts.push({ address, name ,publicKey});

  localStorage.setItem("WALLET_CONTACTS", JSON.stringify(contacts));
  return true;
}

export const maskDocument = (doc: string): string => { 
  if (!doc) return "";

  const visible = doc.slice(-4);
  const masked = "*".repeat(doc.length - 4);

  return `${masked}${visible}`; 
};

export const maskName = (name: string): string => {
  if (!name) return "";

  if (name.length <= 2) {
    return name[0] + "*".repeat(name.length - 1);
  }

  const first = name[0];
  const last = name[name.length - 1];
  const middle = "*".repeat(name.length - 2);

  return `${first}${middle}${last}`;
};

export const maskPhone = (phone: string): string => {
  if (!phone) return "";
  const visible = phone.slice(-3);
  const masked = "*".repeat(Math.max(0, phone.length - 3));
  return masked + visible;
};

export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split("@");

  if (localPart.length <= 3) {
    return email;
  }

  const firstTwo = localPart.slice(0, 2);
  const beforeAt = localPart.slice(-1); 
  const masked = "*".repeat(localPart.length - 3); 

  return `${firstTwo}${masked}${beforeAt}@${domain}`;
};

export const maskAddress = (address: string): string => {
  if (!address) return "";

  return address
    .split("")
    .map((character, i) => {
      if (i < 2) return character;
      if (character === " ") return " ";
      return "*";
    })
    .join("");
};
// Salva o login (use no sucesso do /login)
export function setAuth(user, remember = false) {
  const store = remember ? localStorage : sessionStorage;
  store.setItem("tw_auth", "1");
  if (user) store.setItem("tw_user", JSON.stringify(user));
}

// Verifica se está logado (usado pelo guard)
export function isAuthed() {
  return !!(localStorage.getItem("tw_auth") || sessionStorage.getItem("tw_auth"));
}

// Lê o usuário salvo (para exibir nome/email no botão, opcional)
export function getUser() {
  const raw = localStorage.getItem("tw_user") || sessionStorage.getItem("tw_user");
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

// **Logout**: limpa tudo do front
export function clearAuth() {
  ["tw_auth", "tw_user"].forEach(k => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

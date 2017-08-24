export const save = (key, object) => {
  let saved = localStorage.getItem(key);
  if (saved) {
    saved = JSON.parse(saved);
  } else {
    saved = [];
  }

  if (saved.length === 256) {
    saved.pop();
  }
  saved = saved.concat(object);
  localStorage.setItem(key, JSON.stringify(saved));
}


const globalDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const hours = new Date().getHours()
const isDayTime = hours > 6 && hours < 20;
if(isDayTime === true){
  localStorage.setItem('theme', 'white');
} else {
  localStorage.setItem('theme', 'dark');
}

const localMode = localStorage.getItem('theme');

if (globalDark && (localMode === null)) {

  localStorage.setItem('theme', 'dark');
  document.documentElement.setAttribute('data-dark-mode', '');

}

if (globalDark && (localMode === 'dark')) {

  document.documentElement.setAttribute('data-dark-mode', '');

}

if (localMode === 'dark') {

  document.documentElement.setAttribute('data-dark-mode', '');

}

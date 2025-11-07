// === localStorage ===
function getSubs(){
  try{ return JSON.parse(localStorage.getItem('subs')||'[]'); }
  catch{ return []; }
}
function setSubs(list){
  try{ localStorage.setItem('subs',JSON.stringify(list)); }
  catch{ console.warn('localStorage недоступен'); }
}

// === +1 месяц ===
function addMonths(date, n){
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0,10);
}

// === рендер таблицы ===
function render(){
  const subs = getSubs()
    .sort((a,b)=> new Date(a.nextPay) - new Date(b.nextPay));

  const rows = subs
    .map((s,idx)=>{
      const next     = addMonths(s.nextPay,1);
      const daysLeft = Math.ceil((new Date(next) - new Date()) / 86400000);
      const status   = daysLeft < 0 ? '❌' : '✅';
      return `<tr data-idx="${idx}" style="animation:fadeIn .4s">
                <td>${s.name}</td>
                <td>${s.price} ₽</td>
                <td>${next}</td>
                <td class="days">${daysLeft<0?'просрочено':`${daysLeft} дн.`}</td>
                <td class="status">${status}</td>
              </tr>`;          // нет колонки корзины
    }).join('');

  const tbody = document.querySelector('#list tbody');
  if(tbody) tbody.innerHTML = rows || '<tr><td colspan="5">Подписок пока нет</td></tr>';

  updateStats();
  drawChart();
}

// === удаление по свайпу =====
let touchStartX = 0;
let touchEndX   = 0;

document.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, {passive:true});
document.addEventListener('touchend',   e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe(e.target);
}, {passive:true});

function handleSwipe(el){
  const row = el.closest('tr');
  if(!row) return;
  const deltaX = touchStartX - touchEndX;
  if(deltaX < 80) return;                      // свайп влево > 80px

  const idx = row.dataset.idx;
  if(idx === undefined) return;

  // анимация «уезжает влево»
  row.style.transition = 'transform .3s';
  row.style.transform  = 'translateX(-110%)';

  setTimeout(() => {
    const subs = getSubs();
    subs.splice(idx, 1);
    setSubs(subs);
    render();               // перерисуем без удалённой строки
  }, 300);
}

// === удаление по клику на строку (fallback) === */
document.addEventListener('click', e => {
  const row = e.target.closest('tr');
  if(!row || !row.dataset.idx) return;
  if(confirm('Удалить подписку?')){
    const idx = row.dataset.idx;
    const subs = getSubs();
    subs.splice(idx, 1);
    setSubs(subs);
    render();
  }
});

// === статистика (4 показателя) ==========
function updateStats(){
  const subs = getSubs();
  const total    = subs.length;
  const avgPrice = total ? Math.round(subs.reduce((s,x)=>s+ (+x.price),0)/total) : 0;
  const yearCost = total ? Math.round(subs.reduce((s,x)=>s+ (+x.price)*12,0)) : 0;
  const avgDays  = total ? Math.round(subs.reduce((s,x)=>{
                     const next = addMonths(x.nextPay,1);
                     return s+Math.max(0,Math.ceil((new Date(next)-new Date())/86400000));
                   },0)/total) : 0;

  let mostExpName = '-';
  if(total) mostExpName = subs.reduce((max,cur)=> (+cur.price) > (+max.price) ? cur : max).name;

  /* **жёстко» по существующим id – не создаём новых элементов */
  document.getElementById('totalSub').textContent   = total;
  document.getElementById('avgPrice').textContent   = avgPrice;
  document.getElementById('totalYear').textContent  = yearCost;
  document.getElementById('avgDays').textContent    = avgDays;
  document.getElementById('mostExpensive').textContent = mostExpName;
}


// === диаграмма ===
function drawChart(){
  const canvas = document.getElementById('chart');
  if(!canvas) return;
  const subs = getSubs();
  if(!subs.length){canvas.style.display='none';return;}
  canvas.style.display='block';
  const ctx=canvas.getContext('2d');
  if(window.myPie)window.myPie.destroy();
  window.myPie=new Chart(ctx,{
    type:'pie',
    data:{
      labels:subs.map(s=>s.name),
      datasets:[{data:subs.map(s=>+s.price),
                 backgroundColor:['#6750a4','#9a7bc6','#c9b6e4','#e6d7f4','#f3edf7'],
                 borderWidth:0}]
    },
    options:{responsive:true,plugins:{legend:{display:false}},cutout:'60%'}
  });
}

// === добавление подписки ===
document.addEventListener('DOMContentLoaded',()=>{
  const form = document.getElementById('addForm');
  if(form){
    form.nextPay.value = new Date().toISOString().slice(0,10);
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const {name,price,nextPay} = form;
      if(!name.value || !price.value || !nextPay.value){
        alert('Заполните все поля!');
        return;
      }
      const subs = getSubs();
      subs.push({name:name.value.trim(), price:+price.value, nextPay:nextPay.value});
      setSubs(subs);
      form.reset();
      form.nextPay.value = new Date().toISOString().slice(0,10);
      render();
    });
  }
  render();
});


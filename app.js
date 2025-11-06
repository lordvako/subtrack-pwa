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
    .sort((a,b)=> new Date(a.nextPay) - new Date(b.nextPay))
    .map((s,idx)=>{
      const next = addMonths(s.nextPay,1);
      const daysLeft = Math.ceil((new Date(next) - new Date()) / 86400000);
      const status = daysLeft < 0 ? '❌' : '✅';
      return `<tr style="animation:fadeIn .4s">
                <td>${s.name}</td>
                <td>${s.price} ₽</td>
                <td>${next}</td>
                <td class="days">${daysLeft<0?'просрочено':`${daysLeft} дн.`}</td>
                <td class="status">${status}</td>
                <td class="del" onclick="del(${idx})">🗑️</td>
              </tr>`;
    }).join('');
  list.querySelector('tbody').innerHTML = rows || '<tr><td colspan="6">Подписок пока нет</td></tbody>';
  updateStats();
  drawChart();
}

// === удаление ===
function del(idx){
  const subs = getSubs();
  subs.splice(idx,1);
  setSubs(subs);
  render();
}

// === СТАТИСТИКА (только 3 пункта) ===
function updateStats(){
  const subs = getSubs();
  if (!subs.length){
    ['totalSub','totalYear','mostExpensive'].forEach(id=>document.getElementById(id).textContent='0');
    return;
  }
  const total     = subs.length;
  const yearCost  = Math.round(subs.reduce((s,x)=>s+x.price*12,0));   // всегда *12
  const maxSub    = subs.reduce((max,x)=>x.price>max.price?x:max, subs[0]);

  document.getElementById('totalSub').textContent      = total;
  document.getElementById('totalYear').textContent     = yearCost;
  document.getElementById('mostExpensive').textContent = `${maxSub.price} ₽ ${maxSub.name}`;

  // === ДОПОЛНИТЕЛЬНЫЕ: «₽ в год» и «дороже всего» ===
  extraStats();
}

// === ДИАГРАММА PIE (без изменений) ===
function drawChart(){
  const subs = getSubs();
  const ctx  = document.getElementById('chart').getContext('2d');
  if (!subs.length){
    document.getElementById('chart').style.display='none';
    return;
  }
  document.getElementById('chart').style.display='block';

  const data   = subs.map(s=>s.price);
  const labels = subs.map(s=>s.name);

  new Chart(ctx,{
    type:'pie',
    data:{
      labels:labels,
      datasets:[{
        data:data,
        backgroundColor:['#6750a4','#9a7bc6','#c9b6e4','#e6d7f4','#f3edf7'],
        borderWidth:0
      }]
    },
    options:{responsive:true,plugins:{legend:{display:false}},cutout:'60%'}
  });
}

// === добавление ===
addForm.onsubmit = e =>{
  e.preventDefault();
  const {name,price,period,nextPay} = addForm;
  if(!name.value || !price.value || !nextPay.value){
    alert('Заполните все поля!');
    return;
  }
  const subs = getSubs();
  subs.push({name:name.value, price:price.value, period:period.value, nextPay:nextPay.value});
  setSubs(subs);

  alert('Подписка добавлена!');
  console.log('Добавлено:', name.value, price.value, period.value, nextPay.value);

  addForm.reset();
  render();
};

document.addEventListener('DOMContentLoaded',()=>{
  render();
  addForm.nextPay.value = new Date().toISOString().slice(0,10);
});

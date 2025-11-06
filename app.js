// === localStorage ===
function getSubs(){ return JSON.parse(localStorage.getItem('subs')||'[]'); }
function setSubs(list){ localStorage.setItem('subs',JSON.stringify(list)); }

// === +1 месяц ===
function addMonths(date, n){
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0,10);
}

// === рендер таблицы ===
function render(){
  const rows = getSubs()
    .sort((a,b)=> new Date(a.nextPay) - new Date(b.nextPay))
    .map((s,idx)=>{
      const next = addMonths(s.nextPay,+s.period);
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
  list.querySelector('tbody').innerHTML = rows || '<tr><td colspan="6">Подписок пока нет</td></tr>';
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

// === СТАТИСТИКА ===
function updateStats(){
  const subs = getSubs();
  const total   = subs.length;
  const avgPrice= total ? Math.round(subs.reduce((s,x)=>s+x.price,0)/total) : 0;
  const yearCost= subs.reduce((s,x)=>s+x.price*(12/x.period),0);
  const avgDays = total ? Math.round(subs.reduce((s,x)=>{
    const next = addMonths(x.nextPay,+x.period);
    return s+Math.max(0,Math.ceil((new Date(next)-new Date())/86400000));
  },0)/total) : 0;

  document.getElementById('totalSub').textContent  = total;
  document.getElementById('avgPrice').textContent  = avgPrice;
  document.getElementById('totalYear').textContent = Math.round(yearCost);
  document.getElementById('avgDays').textContent   = avgDays;
}

// === ДИАГРАММА PIE (цены) ===
function drawChart(){
  const subs = getSubs();
  const ctx  = document.getElementById('chart').getContext('2d');
  const data = subs.map(s=>s.price);
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
  const subs = getSubs();
  subs.push({name:name.value, price:price.value, period:period.value, nextPay:nextPay.value});
  setSubs(subs);
  addForm.reset();
  render();
};

document.addEventListener('DOMContentLoaded',()=>{
  render();
  addForm.nextPay.value = new Date().toISOString().slice(0,10);
});

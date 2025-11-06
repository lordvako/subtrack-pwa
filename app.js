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
  const rows = getSubs()
    .sort((a,b)=> new Date(a.nextPay) - new Date(b.nextPay))
    .map((s,idx)=>{
      const next = addMonths(s.nextPay,1);           // всегда +1 месяц
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

// === СТАТИСТИКА (без period) ===
function updateStats(){
  const subs = getSubs();
  const total   = subs.length;
  const avgPrice= total ? Math.round(subs.reduce((s,x)=>s+x.price,0)/total) : 0;
  const yearCost= total ? Math.round(subs.reduce((s,x)=>s+x.price*12,0)) : 0;   // **всегда *12**
  const avgDays = total ? Math.round(subs.reduce((s,x)=>{
    const next = addMonths(x.nextPay,1);
    return s+Math.max(0,Math.ceil((new Date(next)-new Date())/86400000));
  },0)/total) : 0;

  document.getElementById('totalSub').textContent  = total;
  document.getElementById('avgPrice').textContent  = avgPrice;
  document.getElementById('totalYear').textContent = yearCost;
  document.getElementById('avgDays').textContent   = avgDays;
}

// === ДИАГРАММА PIE (цены) ===
function drawChart(){
  const canvas = document.getElementById('chart');
  if (!canvas) return;               // <-- защита
  const subs = getSubs();
  if (!subs.length) {                // если подписок нет – просто чистим
    canvas.style.display = 'none';
    return;
  }
  canvas.style.display = 'block';
  const ctx  = canvas.getContext('2d');

  // если диаграмма уже есть – уничтожаем, чтобы не рисовать поверх
  if (window.myPie) window.myPie.destroy();

  window.myPie = new Chart(ctx,{
    type:'pie',
    data:{
      labels: subs.map(s=>s.name),
      datasets:[{
        data: subs.map(s=>+s.price),   // приводим к числу
        backgroundColor:['#6750a4','#9a7bc6','#c9b6e4','#e6d7f4','#f3edf7'],
        borderWidth:0
      }]
    },
    options:{responsive:true,plugins:{legend:{display:false}},cutout:'60%'}
  });
}

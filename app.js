function getSubs(){ return JSON.parse(localStorage.getItem('subs')||'[]'); }
function setSubs(list){ localStorage.setItem('subs',JSON.stringify(list)); }

function addMonths(date, n){
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0,10);
}

function render(){
  const rows = getSubs()
    .sort((a,b)=> new Date(a.nextPay) - new Date(b.nextPay))
    .map(s=>{
      const next = addMonths(s.nextPay,1);
      const days = Math.ceil((new Date(next) - new Date()) / 86400000);
      return `<tr>
                <td>${s.name}</td>
                <td>${s.price} ₽</td>
                <td><div>${next}</div><div class="next">${days>0?'через '+days+' дн.':'сегодня'}</div></td>
              </tr>`;
    }).join('');
  list.querySelector('tbody').innerHTML = rows || '<tr><td colspan="3">Подписок пока нет</td></tr>';
}

addForm.onsubmit = e =>{
  e.preventDefault();
  const {name,price,nextPay} = addForm;
  const subs = getSubs();
  subs.push({name:name.value, price:price.value, nextPay:nextPay.value});
  setSubs(subs);
  addForm.reset();
  render();
};
document.addEventListener('DOMContentLoaded',()=>{
  render();
  addForm.nextPay.value = new Date().toISOString().slice(0,10);
});

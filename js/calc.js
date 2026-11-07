/* Lógica de cálculo pura (sem DOM). Preço = (custos + taxas fixas) / (1 − taxas% − margem%). */
const Calc={
 hours:c=>(+c.h||0)+(+c.min||0)/60,
 ppg:m=>m&&m.weight>0?m.price/m.weight:0,
 sum:o=>Object.values(o).reduce((a,b)=>a+b,0),
 parts(S,pk){const c=S.cur,s=S.set,pr=S.printers.find(x=>x.id==c.printer),m=S.materials.find(x=>x.id==c.material),h=Calc.hours(c),P=S.plats[pk],on=S.costs.filter(x=>x.on),
  fix=on.filter(x=>x.type=='fixo').reduce((a,x)=>a+x.value,0),vr=on.filter(x=>x.type!='fixo').reduce((a,x)=>a+x.value,0);
  const prod={Filamento:c.grams*(1+c.loss/100)*Calc.ppg(m),Energia:s.energyOn&&pr?pr.watts/1000*h*s.kwh:0,Manutenção:s.maintOn&&pr?pr.maint*h:0,
   Depreciação:s.depOn&&pr&&pr.life>0?pr.price/pr.life*h:0,'Mão de obra':c.labor,Acabamento:c.finish,'Outros custos':c.extra,
   'Custos fixos rateados':s.monthHours>0?fix/s.monthHours*h:0,'Outros custos variáveis':vr};
  const logi={Embalagem:S.packs.filter(x=>c.packs.includes(x.id)).reduce((a,x)=>a+x.price,0),'Envio pago pelo vendedor':c.ship,'Frete subsidiado':P.sub};
  return{prod,logi,pp:Calc.sum(prod),lp:Calc.sum(logi),base:Calc.sum(prod)+Calc.sum(logi),pct:(P.com+P.pay)/100,fix:P.fixed+P.extra,P,fixedMissingHours:fix>0&&!(s.monthHours>0)}},
 price(b,mg){const d=1-b.pct-mg/100;return d>0?(b.base+b.fix)/d:null},
 at(b,price){const fees=price*b.pct+b.fix;return{fees,net:price-fees,profit:price-fees-b.base,margin:price>0?(price-fees-b.base)/price*100:0}}};
if(typeof module!=='undefined')module.exports=Calc;

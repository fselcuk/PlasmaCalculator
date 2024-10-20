const plotButtonMars=document.getElementById("plotBtnMars")

////////// INPUTS FROM USER ///////////////
let u_swEl1= document.getElementById("Input1M")
let n_swEl1=document.getElementById("Input2M")
let roEl1=document.getElementById("Input3M")
let kappaEl1=document.getElementById("Input4M")
let eccEl1=document.getElementById("Input5M")
let bsEl1=document.getElementById("Input6M")



////Clicking the Plot button makes the Plot visible///////////////

plotButtonMars.addEventListener("click", function(){
  
  let u_sw=parseFloat(u_swEl1.value)
  let n_sw=parseFloat(n_swEl1.value)
  let ro=parseFloat(roEl1.value)
  let kappa=parseFloat(kappaEl1.value)
  let ecc=parseFloat(eccEl1.value)
  let bs=parseFloat(bsEl1.value)
  

console.log(u_sw)
console.log(n_sw)
console.log(ro)
console.log(kappa)
console.log(ecc)
console.log(bs)

p_dyn=(1.67e-27)*((u_sw*1e3)**2)*(n_sw*1e6)
muu=4*Math.PI*1E-7
bz=Math.sqrt(2*muu*p_dyn*kappa)

bz_sbt=4.0345e-08  //Bz_needed_in_pressure_balance for mars
  
// x_nose_MP_Rp_Nominal(1) = 1.4;    % Space Physics, An Introduction, Russell,Luhmaan,Strangeway, 2016, Table 12.1.
// x_nose_MP_Rp_Nominal(2) = 1.1;    % For test purposeses, should be fine-tuned later
// x_nose_MP_Rp_Nominal(3) = 10;     % Space Physics, An Introduction, Russell,Luhmaan,Strangeway, 2016, Table 12.1.
// x_nose_MP_Rp_Nominal(4) = 1.1;    % For test purposeses, should be fine-tuned later
// x_nose_MP_Rp_Nominal(5) = 41;     % Space Physics, An Introduction, Russell,Luhmaan,Strangeway, 2016, Table 12.1.
// x_nose_MP_Rp_Nominal(6) = 19;     % Space Physics, An Introduction, Russell,Luhmaan,Strangeway, 2016, Table 12.1.
// x_nose_MP_Rp_Nominal(7) = 24;     % Space Physics, An Introduction, Russell,Luhmaan,Strangeway, 2016, Table 12.1.
// x_nose_MP_Rp_Nominal(8) = 23;    
x_nose_MP_sbt=1.1 //venus
  B_surf_mag_equator=0.5*bz_sbt*(x_nose_MP_sbt**3); 
 console.log("B_surf_mag_equator: ", B_surf_mag_equator)
 

x_nose=(2*B_surf_mag_equator/bz)**(1/3)
console.log("x_nose ", x_nose)

ro_term=ro*x_nose

lamda=ro_term/(Math.sqrt(2*x_nose))
x_o_mp=x_nose-(lamda**2)/2

x_o_bs=0.55 //mars 
x_nose_bs=bs*x_nose
l_bs=(x_nose_bs-x_o_bs)*(1+ecc)

///Conic Bow Shock////
let teta_max=140
teta=_.range(0,teta_max*Math.PI/180,0.01)
cosTeta=_.map(teta, function(num){return Math.cos(num)})
sinTeta=_.map(teta, function(num){return Math.sin(num)})
ecc_x_cosTeta=_.map(cosTeta, function(a){return a*ecc})
ecc_x_cosTeta_One=_.map(ecc_x_cosTeta, function(addOne){return addOne+1})
r_bs_pre=_.map(ecc_x_cosTeta_One, function(x){return Math.pow(x,-1)})
r_bs=_.map(r_bs_pre, function(x){return l_bs*x})

carpim=_.map(r_bs, function(x, index){return cosTeta[index]*x})

x_bs=_.map(carpim, function(x){return x+x_o_bs})
y_bs=_.map(r_bs, function(x,index){return sinTeta[index]*x})

// Filter out anomaly points 
var filtered_x = [];
var filtered_y = [];
for (var i = 0; i < x_bs.length; i++) {
    if (x_bs[i] > 1.1 * x_bs[0]) {
        // Skip anomaly points
        continue;
    }
    // Add non-anomaly points to filtered arrays
    filtered_x.push(-1 * x_bs[i]);
    filtered_y.push(-1 * y_bs[i]);
}

///earth_shape////
let Earth=_.range(0,2*Math.PI,0.1)
EarthSin=_.map(Earth, function(a){return Math.sin(a)})
EarthCos=_.map(Earth, function(a){return Math.cos(a)})

///Magnetopause///
let muu_tmp_MP=_.range(0,30,0.1)
mu_tmp_sqr=_.map(muu_tmp_MP, function(sqr){ return Math.pow(sqr,2)})
neg_mu_tmp_sqr=_.map(mu_tmp_sqr, function(neg){ return neg*-1})
lamdakareIleTopla=_.map(neg_mu_tmp_sqr, function(a){return  a+Math.pow(lamda,2)})
x_MP=_.map(lamdakareIleTopla, function(bol){return bol/2+x_o_mp})
y_MP=_.map(muu_tmp_MP, function(a){ return a*lamda})




let data = [{
    x: filtered_x,
    y: y_bs,
    type: 'scatter',
    name:'Bowshock',
    line: {
        color: 'blue',
        width: 2,
        
      }},{
    x: filtered_x,
    y:filtered_y,
    type: 'scatter',
    showlegend:false,
    name:'Bowshock',
    line: {
        color: 'blue',
        width: 2,
      }
   },
   {
    // x: _.map(x_MP, function(x){return -1*x}),
    // y: y_MP,
    // type: 'scatter',
    // name:'Magnetopause',
    // line: {
    //     color: 'red',
    //     width: 2,
        
    //   }},{
    // x: _.map(x_MP, function(x){return -1*x}),
    // y:_.map(y_MP, function(x){return -1*x}),
    // type: 'scatter',
    // name:'Magnetopause',
    // showlegend:false,
    // line: {
    //     color: 'red',
    //     width: 2,
    //   }
   },
   {
    x:EarthSin,
    y:EarthCos,
    fill:'toself',
    color:'#BA6E15',
    fillcolor:'#BA6E15',
    name:'Mars'
   }

]
let layout = {
    title: 'MARS',
    height: 800,
    width: 800,
    font: {size: 13},
    plot_bgcolor: '',
    paper_bgcolor: '#ace', 
    barmode: 'relative',
    yaxis: {title: 'Y [R<sub>Mars</sub>]', range: [-4, 4], dtick: 5},
    xaxis: {title: 'X [R<sub>Mars</sub>]', range: [-4, 4]}};
let config = {responsive: true};




Plotly.newPlot('plot', data, layout, config);

 
 })

////end of plot function///////////////////



//// Function for the magnetosphere Max-Min input values ////////////////
function minMax(that, value){
  let min = parseFloat(that.getAttribute("min"))
  let max= parseFloat(that.getAttribute("max"))
  let val=parseFloat(value)

  if( val<min || isNaN(val)){
    return min
  } else if(val> max){
    return max
  } else {
    return val;
  }
}


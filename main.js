let tableDiv,output;

const data = new Matrix(2,2);

let table = new CRDTable();

function onLoad(){
	tableDiv = document.querySelector("div#DataTable");
	output = document.querySelector("div#Output");

	createInitialTable();
}

function createInitialTable(){
	table.appendTo(tableDiv);
}

function addTreatment(){
	tableDiv.innerHTML = "";
	table.addTreatment();
	table.appendTo(tableDiv);
}

function addBlock(){
	tableDiv.innerHTML = "";
	table.addBlock();
	table.appendTo(tableDiv);
}

function findANOVA_CRD(){
	let matrix = table.getMatrix();

	let a = matrix.col;
	let row = matrix.row;
	let N = a * row;

	let sumTreatments = matrix.reduceRow((a,b)=>a+b,0);
	let sumTotal = matrix.reduce((a,b)=>a+b,0);

	let SSE = Matrix.copy(matrix).reduceColumn((cum,value,col) => {
		return cum + Math.pow(value - sumTreatments[col]/a,2);
	},0).reduce((a,b)=>a+b,0);

	let SST = Matrix.copy(matrix).reduce((a,b) => {
		return a + Math.pow(b - sumTotal/N,2);
	},0);

	let SSTR = SST - SSE;
	SSTR = roundOff(SSTR,3);
	SSE = roundOff(SSE,3);
	SST = roundOff(SST,3);

	let prefs = [
		{
			ss: SSTR,
			df: a-1,
			ms: roundOff(SSTR / (a-1),3)
		},{
			ss: SSE,
			df: N-a,
			ms: roundOff(SSE / (N-a),3)
		},{
			ss: SST,
			df: N-1,
			ms: null
		}
	];

	let anova = new AnovaTable(prefs);
	anova.fstat = roundOff((SSTR / (a-1)) / (SSE / (N-a)),3);
	anova.addSource("Treatment","Error","Total");
	anova.appendTo(output);
}

function findANOVA_RCBD(){
	let matrix = table.getMatrix();

	let a = matrix.col;
	let b = matrix.row;
	let N = a * b;

	let sumTreatments = matrix.reduceRow((a,b)=>a+b,0);
	let sumBlocks = matrix.reduceColumn((a,b)=>a+b,0);
	let ydotdot = matrix.reduce((a,b)=>a+b,0);

	let yidot = sumTreatments.reduce((a,b)=>{
		return a + Math.pow(b,2);
	},0) / b;

	let ydoti = sumBlocks.reduce((a,b)=>{
		return a + Math.pow(b,2);
	},0) / a;

	let SSTR = yidot - Math.pow(ydotdot,2) / N;
	let SSB = ydoti - Math.pow(ydotdot,2) / N;

	let SST = Matrix.copy(matrix).reduce((a,b) => {
		return a + Math.pow(b - ydotdot/N,2);
	},0);

	let SSE = SST - SSB - SSTR;

	SSTR = roundOff(SSTR,3);
	SSB = roundOff(SSB,3);
	SSE = roundOff(SSE,3);
	SST = roundOff(SST,3);

	let prefs = [
		{
			ss: SSTR,
			df: (a-1),
			ms: roundOff(SSTR / (a-1),3)
		},{
			ss: SSB,
			df: (b-1),
			ms: roundOff(SSB / (b-1),3)
		},{
			ss: SSE,
			df: (a-1) * (b-1),
			ms: roundOff(SSE / ((a-1) * (b-1)),3)
		},{
			ss: SST,
			df: N-1,
			ms: null
		}
	];

	let anova = new AnovaTable(prefs);
	anova.fstat = roundOff((SSTR / (a-1)) / (SSE / ((a-1) * (b-1))),3);
	anova.addSource("Treatment","Block","Error","Total");
	anova.appendTo(output);
}

function findANOVA_LSD(){
	let rawMatrix = table.getMatrixRaw();
	let valueMatrix = new Matrix(rawMatrix.row,rawMatrix.col);

	let treatments = {};
	let nTreatment = 0;
	let nRow = valueMatrix.row;
	let nCol = valueMatrix.col;
	let nTotal = nRow * nCol - 1;

	rawMatrix.map((value,row,col)=>{
		const v = value.split("=");
		let t = v[0];
		let val = parseFloat(v[1]);
		if(!t) return;
		if(typeof treatments[t] === "undefined") {
			treatments[t] = [];
			nTreatment++;
		}
		if(!isNaN(val)) valueMatrix.cell[row][col] = val;
		treatments[t].push(valueMatrix.cell[row][col]);
	});

	let nError = nTotal - nTreatment - nRow - nCol;

	if(nTreatment !== nRow || nTreatment !== nCol || nRow !== nCol) {
		alert(`The Latin Square Design can't be apply to the data! Rows: ${nRow} != Column: ${nCol} != Treatment: ${nTreatment}`);
		return;
	}

	const ydotdot = valueMatrix.reduce((a,b)=>a+b,0);
	const N = nRow * nCol;
	const ydotdot2 = Math.pow(ydotdot,2);

	const ysquare = valueMatrix.reduce((a,b)=>a+Math.pow(b,2),0);
	const SST = ysquare - ydotdot2 / N;

	let sumTreatments = {};
	for(let treatment in treatments){
		if(!sumTreatments[treatment]) sumTreatments[treatment] = 0;
		if(!(treatments[treatment] instanceof Array)) break;
		for(let data of treatments[treatment]){
			sumTreatments[treatment] += data;
		}
	}

	let str2 = 0;
	for(let treatment in sumTreatments){
		str2 += Math.pow(sumTreatments[treatment],2);
		console.log(`str2 = ${str2}, SS<${treatment}> = ${sumTreatments[treatment]}`);
	}
	const SSTR = str2 / nTreatment - ydotdot2 / N;

	let srow2 = valueMatrix.reduceColumn((a,b)=>a+b,0).reduce((a,b)=>a+Math.pow(b,2),0);
	const SSR = srow2 / nRow - ydotdot2 / N;

	let scol2 = valueMatrix.reduceRow((a,b)=>a+b,0).reduce((a,b)=>a+Math.pow(b,2),0);
	const SSC = scol2 / nCol - ydotdot2 / N;

	const SSE = SST - SSTR - SSR - SSC;
	const dfTR = nTreatment - 1;
	const dfR = nRow - 1;
	const dfC = nCol - 1;
	const dfE = nRow * nCol - 3 * nRow + 2;
	const dfT = nRow * nCol - 1;

	let prefs = [
		{
			ss: SSTR,
			df: dfTR,
			ms: roundOff(SSTR / dfTR,3)
		},{
			ss: SSR,
			df: dfR,
			ms: roundOff(SSR / dfR,3)
		},{
			ss: SSC,
			df: dfC,
			ms: roundOff(SSC / dfC,3)
		},{
			ss: SSE,
			df: dfE,
			ms: roundOff(SSE / dfE,3)
		},{
			ss: SST,
			df: dfT,
			ms: null
		}
	];

	let anova = new AnovaTable(prefs);
	anova.fstat = roundOff(prefs[0].ms / prefs[3].ms,3);
	anova.addSource("Treatment","Row","Column","Error","Total");
	anova.appendTo(output);
}

function roundOff(value,nearest=0){
	if(nearest < 0) nearest = 0;
	const n = Math.pow(10,nearest);
	return Math.round(value * n) / n;
}
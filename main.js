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

function roundOff(value,nearest=0){
	if(nearest < 0) nearest = 0;
	const n = Math.pow(10,nearest);
	return Math.round(value * n) / n;
}
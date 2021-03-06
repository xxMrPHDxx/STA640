class CRDTable {
	constructor(rows=0,cols=0){
		this.treatments = 2;
		this.blocks = 2;
		this.head = [
			["Treatment"],
			["X1","X2"]
		];
		this.body = [
			["Block","Y1"],
			["Y2"],
		];
		this.data = [];
	}
	addTreatment(){
		this.treatments++;
		this.head[1].push(`X${this.treatments}`);
	}
	addBlock(){
		this.blocks++;
		this.body.push([`Y${this.blocks}`]);
	}
	appendTo(parent){
		this.data = [];
		let elem = document.createElement("table");

		let thead = document.createElement("thead");
		for(let row=0;row<this.head.length;row++){
			let tr = document.createElement("tr");
			for(let col=0;col<this.head[row].length;col++){
				let value = this.head[row][col];
				if(row === 0){
					let td = document.createElement("td");
					td.setAttribute("rowspan",2);
					td.setAttribute("colspan",2);
					tr.appendChild(td);
					
					td = document.createElement("td");
					td.textContent = value;
					td.setAttribute("colspan",this.treatments);
					tr.appendChild(td);
				}else{
					let td = document.createElement("td");
					td.textContent = value;
					tr.appendChild(td);
				}
			}
			thead.appendChild(tr);
		}
		elem.appendChild(thead);

		let tbody = document.createElement("tbody");
		for(let row=0;row<this.body.length;row++){
			let tr = document.createElement("tr");
			for(let col=0;col<this.body[row].length;col++){
				let value = this.body[row][col];
				if(row === 0 && value == "Block"){
					let td = document.createElement("td");
					td.setAttribute("rowspan",this.blocks);
					td.textContent = value;
					tr.appendChild(td);
				}else{
					let td = document.createElement("td");
					td.textContent = value;
					tr.appendChild(td);
				}
			}
			for(let col=0;col<this.treatments;col++){
				let td = document.createElement("td");
				td.setAttribute("class","DataCell");
				let input = document.createElement("input");
				input.setAttribute("class","DataCell");

				td.appendChild(input);
				tr.appendChild(td);

				this.data.push({
					elem: input,
					row,
					col
				});
			}
			tbody.appendChild(tr);
		}
		elem.appendChild(tbody);

		parent.appendChild(elem);
	}
	getMatrix(){
		let data = new Matrix(this.blocks,this.treatments);
		table.data.forEach(({elem,row,col})=>{
			let value = parseFloat(elem.value);
			if(!isNaN(value)) data.cell[row][col] = value;
		});
		return typeof data === "undefined" ? new Matrix() : data;
	}
	getMatrixRaw(){
		let data = new Matrix(this.blocks,this.treatments);
		table.data.forEach(({elem,row,col})=>{
			data.cell[row][col] = elem.value;
		});
		return data;
	}
}
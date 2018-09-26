class AnovaTable {
	constructor(ssdata){
		if(!(ssdata instanceof Array)) throw new Error("Argument 1 must be an array");
		this.row = ssdata.length;
		this.ss = ssdata.map((_,i)=>ssdata[i].ss);
		this.df = ssdata.map((_,i)=>ssdata[i].df);
		this.ms = ssdata.map((_,i)=>ssdata[i].ms);
		this.sources=[];
	}
	addSource(...sources){
		this.sources = sources;
	}
	set fstat(value){
		this._fstat = value;
	}
	get fstat(){
		return this._fstat;
	}
	appendTo(parent){
		let table = document.createElement("table");

		let thead = document.createElement("thead");
		thead.innerHTML = `
<tr>
	<td>Source of variation</td>
	<td>Sum Square</td>
	<td>df</td>
	<td>Mean Square</td>
	<td>F</td>
</tr>
		`;
		table.appendChild(thead);

		let tbody = document.createElement("tbody");
		for(let i=0;i<this.row;i++){
			let tr = document.createElement("tr");
			[this.sources[i],this.ss[i],this.df[i],this.ms[i]].forEach((val,j,arr)=>{
				let td = document.createElement("td");
				td.textContent = val;
				tr.appendChild(td);
				if(i === 0 && j === 3){
					let td = document.createElement("td");
					td.setAttribute("rowspan",this.row);
					td.textContent = this.fstat;
					tr.appendChild(td);
				}
			});
			tbody.appendChild(tr);
		}
		table.appendChild(tbody);

		parent.appendChild(table);
	}
}
/* d3.chart.setting.js - D3 Chart Common Library for setting
 	writ by yi seung-yong(dragonslam@nate.com)
 	date, 2014/10/04
*/
if (typeof com == 'undefined') var com = {};
if (typeof com.mad == 'undefined') com.mad = {};
if (typeof com.mad.chart == 'undefined') com.mad.chart = {};

/** ****************************************************************************
	Chart Data Schema 
**/

com.mad.chart.setting = {
	type : "line",  // line, bar, pie
	width : 200,
	height: 200,
	margin: {left: 5, top: 5, right: 0, bottom: 0},
	colors : ["#43aea8", "#6e84be", "#60b1cc"],
	arcOuter : 0,
	arcInner : 40,
	styleCalss : '',
	showLabels : false,
	format : null,
	lables : null,			// lable data
	image : null,			// image data
	background : null		// image data
};

com.mad.chart.data = {
	depth:0,
	name: '', 
	value: '',
	text:''
};

com.mad.chart.image = {
	x: 0,
	y: 0,
	width: 100,
	height: 100,
	href:''
};

com.mad.chart.lable = {
	x: 0,
	y: 0,
	width: 100,
	height: 100,
	styleCalss:'',
	text:''
};
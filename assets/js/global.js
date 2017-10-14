var React = require('react');
var ReactDOM = require('react-dom');



var options = {
	categories: [
		'color',
		'sex',
		'type'
	],
	postsPerPage: 9
};

var App = React.createClass({
	getInitialState() {
		return {
			listOfPosts: null,
			currentPageId: null,
			chosen: null,
			categories: null
		}
	},
	componentWillMount() {
		this.setState({
			listOfPosts: posts,
			currentPageId: 1,
			chosen: ['all','all','all'],
			categories: options.categories
		})
	},
	componentDidMount() {
		this.activePagerFirstLink();
	},
	componentDidUpdate(prevProps, prevState){
		if(prevState.chosen !== this.state.chosen) {
			this.activeLink();
		}
		if(prevState.currentPageId !== this.state.currentPageId){
			this.activeLink();
		}
	},
	activeLink() {
		$(`a[data-rel=${this.state.currentPageId}]`).parents('li').addClass('active').siblings().removeClass('active');
	},
	activePagerFirstLink() {
		$(`a[data-rel=${this.state.currentPageId}]`).parents('li').addClass('active').siblings().removeClass('active');
	},
	switcher(e) {
		e.preventDefault();
		var newPageId = e.currentTarget.getAttribute('data-rel');
		this.setState({
			currentPageId: newPageId
		})
	},
	handler(e) {
		e.preventDefault();
		let cat = e.currentTarget.getAttribute('data-category');
		let filter = e.currentTarget.getAttribute('data-filter');
		let catPos = this.state.categories.indexOf(cat);
		let chosen = this.state.chosen;
		chosen.splice(catPos,1,filter);
		this.setState({
			chosen: chosen,
			currentPageId: 1
		})
		$(e.currentTarget).parents('li').addClass('active').siblings().removeClass('active');
	},
	render: function() {
		let postsPerPage = options.postsPerPage;

		// filters
		var categories = {};
		this.state.categories.forEach(function(cat) {
			categories[cat] = [];
		});
		for(var cat in categories) {
			this.state.listOfPosts.forEach(function(item) {
				if(categories[cat].indexOf(item[cat]) === -1) {
					categories[cat].push(item[cat]);
				}
			});
			categories[cat].sort(function(a, b) {
				if (a.toLowerCase() < b.toLowerCase()) return -1;
				if (a.toLowerCase() > b.toLowerCase()) return 1;
				return 0;
			});
		}



		let type = this.state.listOfPosts.map(function(item) {
			return item.type;
		});
		type = type.filter(function(item, index, arr) {
			return arr.indexOf(item) == index;
		});

		let color = this.state.listOfPosts.map(function(item) {
			return item.color;
		});
		color = color.filter(function(item, index, arr) {
			return arr.indexOf(item) == index;
		});

		// finding all posts for chosen filters
		var numOfFilters = options.categories.length;
		var catNames = this.state.categories;
		var chosenFilters = this.state.chosen;
		let filteredPosts = this.state.listOfPosts.filter(function(item) {
			let tempArr = [];
			for(let i = 0; i < numOfFilters; i++) {
				if(item[catNames[i]]) {
					if(item[catNames[i]] === chosenFilters[i] || chosenFilters[i] === 'all') {
						tempArr.push(true);
					} else {
						tempArr.push(false);
					}
				}
			}
			if(tempArr.every(function(n) {return n === true})) {
				return item;
			}
		});


		// finding posts on current page
		let currentPageId = this.state.currentPageId;
		let pagedPosts = filteredPosts.filter(function(item, i) {
			return i > currentPageId * postsPerPage - postsPerPage -1 && i <= currentPageId * postsPerPage -1;
		});

		// finding total amount of pages
		let pagesCounter = Math.ceil(filteredPosts.length / postsPerPage);
		let pagesArr = [];
		for(let i = 1; i <= pagesCounter; i++) {pagesArr.push(i);}



		return (
			<div>
				<Filter categories={categories} type={type} color={color} handler={this.handler} />
				<Content posts={pagedPosts} />
				{pagesCounter > 1 && <Pager totalPages={pagesArr} currentPage={currentPageId} switcher={this.switcher} />}
			</div>
		);
	}
});

var FilterLists = React.createClass({
	render: function() {
		let handler = this.props.handler;
		let listCat = this.props.listCat;
		let listContent = this.props.cats[listCat].map((item, i) => {
			return <li key={i}><a data-category={listCat} data-filter={item} onClick={handler} href="#">{item}</a></li>
		});
		return (
			<div>
				<h3>{listCat}</h3>
				<ul key={this.props.listKey} className="filter-nav" ref={this.props.listCat}>
					<li className="active"><a data-category={listCat} data-filter="all" onClick={handler} href="#">all</a></li>
					{listContent}
				</ul>
			</div>
		);
	}
});



var Filter = React.createClass({
	render: function() {
		let catsObj = this.props.categories;
		let catsArr = [];
		for(var cat in catsObj) {
			catsArr.push(cat);
		}
		let lists = catsArr.map((item, i) => {
			return <FilterLists listCat={item} cats={catsObj} listKey={i} handler={this.props.handler} key={i} />
		});
		return (
			<div className="filter-navs">
				{lists}
			</div>
		);
	}
});

var Content = React.createClass({
	render: function() {
		return (
			<div className="boxes">
				{this.props.posts.map((item,i) => {
					return <div key={i} className="box"><div>{item.type}</div><div>{item.color}</div><div>{item.sex}</div></div>
				})}
			</div>
		);
	}
});

var Pager = React.createClass({
	render: function() {
		let cur = +this.props.currentPage,
			max = +this.props.totalPages.length,
			go = this.props.switcher;

		return (
			<ul className="pager">
				{cur > 1 && <li><a data-rel={cur - 1} onClick={go} href="#">&lt;</a></li>}
				{this.props.totalPages.map((item,i) => {
					if(i < cur + 2 && i > cur - 4 || i === max - 1 || i === 0) {
						return <li key={i}><a data-rel={item} onClick={go} href="#">{item}</a></li>
					} else if(i === cur - 4 || i === cur + 2) {
						return <li key={i}>...</li>
					}
				})}
				{cur < max && <li><a data-rel={cur + 1} onClick={go} href="#">&gt;</a></li>}
			</ul>
		);
	}
});

ReactDOM.render(<App />, document.getElementById('filter'));

























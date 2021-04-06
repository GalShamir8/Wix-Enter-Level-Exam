import React, { cloneElement } from 'react';
import './App.scss';
import { createApiClient, Ticket, SortType } from './api';
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";

export type AppState = {
	tickets?: Ticket[],
	filterdTickets?: Ticket[],
	search: string,
	currentFontSize: number,
	pageNumber: number,
	currentContent: string,
	expended: boolean,
	startDate: Date,
	endDate: Date
}


const LESS_CONTENT = 400

const TICKET_HEADR_SIZE = 30;
const S_FONT_SIZE = 15;
const M_FONT_SIZE = 20;
const L_FONT_SIZE = 25;
const DEFAULT_FONT_SIZE = M_FONT_SIZE;

const api = createApiClient();


export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: '',
		pageNumber: 1,
		currentFontSize: DEFAULT_FONT_SIZE,
		currentContent: '',
		expended: false,
		startDate: new Date(2018, 1, 1),
		endDate: new Date(2018, 11, 12)
	}

	searchDebounce: any = null;

	async componentDidMount() {
		await this.fetchTickets(this.state.pageNumber)
	}

	/**
	 * Fetch Ticket from the server
	 * @param pageNumber 
	 */
	fetchTickets = async (pageNumber: number) => {
		this.setState({
			tickets: await api.getTickets(pageNumber),
		});
	}

	renderTickets = (tickets: Ticket[]) => {

		const filteredTickets = tickets
			.filter((t) => (t.title.toLowerCase() + t.content.toLowerCase()).includes(this.state.search.toLowerCase()));
		return (<ul className='tickets' style={{ fontSize: this.state.currentFontSize }}>
			{filteredTickets.map((ticket) => (<li key={ticket.id} className='ticket'>
				<h5 className='title' style={{ fontSize: TICKET_HEADR_SIZE }}>{ticket.title}</h5>

				<h6 className='content'>{this.showTicketContent(ticket)}{"\t"}
					{ticket.content.length > LESS_CONTENT ? (
						this.state.expended ? <label style={{ fontSize: 10, color: "blue" }} onClick={() => {
							this.setState({ expended: false })
						}}>show less...</label> :
							<label style={{ fontSize: 10, color: "blue" }} onClick={() => {
								this.setState({ expended: true })
							}}>show more...</label>) : null} </h6>

				<button className="btn btn-default"
					onClick={() => this.renameTicket(ticket.id, tickets)}
					style={{ width: 100, position: 'absolute', bottom: 45, right: 120 }}>Rename</button>
				<button className="btn btn-default"
					onClick={() => this.cloneTicket(ticket.id, tickets)}
					style={{ width: 100, position: 'absolute', bottom: 45, right: 10 }}>
					Clone
					</button>
				<footer>
					<div className='meta-data'>By {ticket.userEmail} | {new Date(ticket.creationTime).toLocaleString()}</div>
				</footer>
			</li>))}
		</ul>);
	}


	/**
	 * Set filterd Ticket array -> in the range: [startDate, endDate]
	 * note - I know the function not working well (something in the filter), actullay i do not understand why; happy for fidbacks
	 */
	ticketsInRange() {
		const { startDate, endDate, tickets } = this.state;
		if (tickets) {
			this.setState({
				filterdTickets: tickets.filter(({ creationTime }) => creationTime >= startDate.getTime() && creationTime <= endDate.getTime())
			});
		}
	}


	/**
	 * Showing ticket content  -> amount of charchters depended in the expended flag (T/F) 
	 * @param ticket 
	 */
	showTicketContent(ticket: Ticket) {
		if (this.state.expended) {
			return ticket.content
		} else
			return ticket.content.slice(0, LESS_CONTENT)
	}

	/**
	 * Clone ticket via api call to the server -> updating collection both UI and backend 
	 * @param ticketID 
	 * @param tickets 
	 */
	cloneTicket = async (ticketID: string, tickets: Ticket[]) => {
		const foundTicket = tickets.find(ticket => ticket.id === ticketID)
		if (foundTicket !== undefined) {
			const newTicket: Ticket = (await api.addClonedTicket(foundTicket))
			this.setState({ tickets: tickets.concat(newTicket) })
		}
	}


	/**
	 * Rename ticket title via api call to server-> update the backend collection
	 * @param ticketID 
	 * @param tickets 
	 */
	renameTicket = async (ticketID: string, tickets: Ticket[]) => {
		let newTitle = prompt("Enter new title")
		const newTickets = [...tickets]
		const foundTicket = newTickets.find(ticket => ticket.id === ticketID)

		if (foundTicket !== undefined && newTitle) {
			foundTicket.title = newTitle
			api.renameTitle(foundTicket.id, foundTicket.title)
			this.setState({ tickets: newTickets })
		}
	}

	/**
	 * Sorting the tickets array according to the sortOpt
	 * @param sortOpt 
	 */
	sortTicketsByDate(sortOpt: SortType) {
		let sortedTicked: any[] = []
		if (this.state.tickets !== undefined) {
			sortedTicked = [...this.state.tickets];
			if (sortOpt === SortType.byDateASC) {
				this.setState({
					tickets: sortedTicked.sort((t1, t2) => t1.creationTime - t2.creationTime),
				})
			} else {
				this.setState({
					tickets: sortedTicked.sort((t1, t2) => -(t1.creationTime - t2.creationTime)),
				})
			}
		}
	}


	changeFontSize(fontSize: number) {
		if (this.state.currentFontSize !== fontSize) {
			this.setState({
				currentFontSize: fontSize
			})
		}
	}


	onSearch = async (val: string, newPage?: number) => {

		clearTimeout(this.searchDebounce);

		this.searchDebounce = setTimeout(async () => {
			this.setState({
				search: val
			});
		}, 300);
	}

	increment() {
		this.setState((prevState) => {
			const newPageNumber = prevState.pageNumber + 1;
			this.fetchTickets(newPageNumber);
			return { pageNumber: newPageNumber };
		});
	}

	decrement() {
		this.setState((prevState) => {
			const newPageNumber = prevState.pageNumber - 1;
			if (newPageNumber >= 1) {
				this.fetchTickets(newPageNumber);
				return { pageNumber: newPageNumber };
			}
			return { pageNumber: prevState.pageNumber };
		});
	}

	setStartDate(date: [Date, Date] | Date) {
		if (date instanceof Date)
			this.setState({
				startDate: date
			})
	}


	setEndDate(date: [Date, Date] | Date) {
		if (date instanceof Date)
			this.setState({
				endDate: date
			})
	}


	render() {
		const { tickets, filterdTickets, pageNumber, startDate, endDate } = this.state;

		return (<main>
			<h1>Tickets List</h1>
			<button onClick={() => this.decrement()}>{"<"}</button>
			{pageNumber}
			<button onClick={() => this.increment()}>{">"}</button>
			<h2 style={{ fontSize: 15 }}>Choose font size:</h2>
			<button onClick={() => this.changeFontSize(S_FONT_SIZE)} style={{ margin: 5 }}>Small font</button>
			<button onClick={() => this.changeFontSize(M_FONT_SIZE)} style={{ margin: 5 }}>Medium font</button>
			<button onClick={() => this.changeFontSize(L_FONT_SIZE)} style={{ margin: 5 }}>Large font</button>
			<br />
			<header>
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)} />
			</header>
			<select id="sortOptions" defaultValue="0" onChange={(input) => {
				if (input.target.value === "1")
					this.sortTicketsByDate(SortType.byDateDESC)
				else if (input.target.value === "2")
					this.sortTicketsByDate(SortType.byDateASC)
			}}>
				<option value="0">Sort</option>
				<option value="1">
					Show Newest First
					</option>
				<option value="2">
					Show Oldest First
					</option>
			</select>
			<h6>show ticket in range</h6>
			<label style={{ fontSize: 12 }}>Start date: </label>
			<DatePicker selected={startDate} onChange={date => {
				if (date) {
					this.setStartDate(date);
					this.ticketsInRange();
				}
			}
			}></DatePicker>
			<label style={{ fontSize: 12 }}> End date: </label>
			<DatePicker selected={endDate} onChange={date => {
				if (date) {
					this.setEndDate(date);
					this.ticketsInRange();
				}
			}
			}></DatePicker>
			{tickets ? <div className='results'>Showing {(filterdTickets || tickets).length} results</div> : null}
			{tickets ? this.renderTickets(filterdTickets || tickets) : <h2>Loading..</h2>}
		</main>)
	}
}

export default App;
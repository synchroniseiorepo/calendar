var React = require('react');
var ReactDOM = require('react-dom');
var BigCalendar = require('react-big-calendar');
var moment = require('moment');

BigCalendar.setLocalizer(
    BigCalendar.momentLocalizer(moment)
);

var store = new Persist.Store('SynchroniseCalendar');

var Calendar = React.createClass({
    getInitialState: function(){
        return {
            events: [],
            networks: [{
                title: "Google Calendar",
                name: "google",
                className: "btn btn-block btn-social btn-google"
            }, {
                title: "Yahoo Calendar",
                name: "yahoo",
                className: "btn btn-block btn-social btn-yahoo"
            }, {
                title: "Outlook",
                name: "microsoft",
                img: "microsoft.png",
                className: "btn btn-block btn-social btn-microsoft"
            }, {
                title: "Evernote",
                name: "evernote",
                img: "evernote.png",
                className: "btn btn-block btn-social btn-evernote"
            }, {
                title: "Facebook",
                name: "facebook",
                className: "btn btn-block btn-social btn-facebook"
            }],
            tokens: {}
        };
    },
    componentDidMount: function(){
        var target = this;
        target.refreshTokenValues();
    },
    signin: function(network){
        var target = this;

        switch (network) {
            case "google":{
                gapi.auth.authorize({
                    'client_id': '118453749266-ga2nefgvliioui3ft2p6kosj51h9giga.apps.googleusercontent.com',
                    'scope': ["https://www.googleapis.com/auth/calendar.readonly"].join(' '),
                    'immediate': true
                }, function(authResult){
                    if (authResult && !authResult.error) {
                        authorizeDiv.style.display = 'none';
                        target.loadGoogleCalendar();
                    }
                });
            }
                break;

            case "facebook":{
                FB.login(function(response) {
                    store.set('facebookToken', response.authResponse.accessToken);
                    store.save();
                    target.refreshTokenValues();
                }, {scope: 'user_events'});
                return false;
            }
                break;
        }
    },
    refreshTokenValues: function(){
        var target = this;
        var tokens = target.state.tokens;

        for(var i = 0; i < target.state.networks.length; i++){
            var row = target.state.networks[i];
            if(store.get(row.name+'Token')){
                tokens[row.name] = store.get(row.name);
            }
        }

        target.setState({tokens: tokens});
    },
    loadGoogleCalendar: function(){
        gapi.client.load('calendar', 'v3', function(){
            var request = gapi.client.calendar.events.list({
                'calendarId': 'primary',
                'timeMin': (new Date()).toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 10,
                'orderBy': 'startTime'
            });

            request.execute(function(resp) {
                console.log(resp);
                /*var events = resp.items;
                appendPre('Upcoming events:');

                if(events.length > 0){
                    for (i = 0; i < events.length; i++) {
                        var event = events[i];
                        var when = event.start.dateTime;
                        if(!when){
                            when = event.start.date;
                        }
                        appendPre(event.summary + ' (' + when + ')')
                    }
                }else{
                    appendPre('No upcoming events found.');
                }*/
            });
        });
    },
    render: function(){
        var begin = new Date();
        var end   = new Date();
            end.setDate(end.getDate() + 2);

        var target = this;

        return (
            <div>
                <div style={{textAlign:"center", display: "block", marginBottom: "30px"}}>
                    {this.state.networks.map(function(row, index){
                        var img = "";
                        if(row.hasOwnProperty('img')){
                            img = (<img src={row.img} style={{width: "21px", height: "21px", marginTop: "5.5px", marginLeft: "2px", paddingRight: "2.5px"}}/>)
                        }else{
                            img = (<span className={"fa fa-"+row.name}></span>);
                        }

                        var title = row.title;
                        if(target.state.tokens.hasOwnProperty(row.name)){
                            title = "Disconnect";
                        }

                        return (
                            <a key={"network"+index} onClick={target.signin.bind(null, row.name)} className={row.className} style={{width: "200px", display: "inline-block", marginRight: "10px", marginTop: "0px"}}>
                                {img} {title}
                            </a>
                        );
                    })}
                </div>

                <BigCalendar events={this.state.events}
                />
            </div>
        );
    }
});

ReactDOM.render(<Calendar/>, document.getElementById('calendar'));

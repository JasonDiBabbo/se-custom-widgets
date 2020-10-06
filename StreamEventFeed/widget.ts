/**
 * Rotating Alert Feed v1.0.0
 * 
 * - @JasonDiBabbo
 */

enum StreamEventType {
    Follow,
    Subscription,
    Cheer
}

abstract class StreamEvent {
    public abstract get isValid(): boolean;

    public abstract html: string;

    constructor(public eventType: StreamEventType) { }

    public static lookupIconCss(eventType: StreamEventType): string {
        let iconCss = null;

        switch (eventType) {
            case StreamEventType.Follow:
                iconCss = 'fas fa-heart';
                break;
            case StreamEventType.Subscription:
                iconCss = 'fas fa-star';
                break;
            default:
                break;
        }

        return iconCss;
    }
}

class FollowEvent extends StreamEvent {
    public get isValid(): boolean {
        return !!this.html && !!this.name;
    }

    public html: string;

    public name: string;

    constructor(event: any) {
        super(StreamEventType.Follow);

        this.name = !!event ? event.name : null;
        this.html = this.getHtml();
    }

    protected static SInit = (() => {
        FollowEvent.prototype.name = null;
        FollowEvent.prototype.html = null;
    })();

    private getHtml(): string {
        const iconCss = StreamEvent.lookupIconCss(this.eventType);

        if (!!iconCss && !!this.name) {
            const iconHtml = `<i class="bar-icon ${iconCss}"></i>`;
            const spanHtml = `<span class="bar-text">${this.name}</span>`;
            const html = `${iconHtml}${spanHtml}`;

            return html;
        }

        return null;
    }
}

class SubscriptionEvent extends StreamEvent {
    public get isValid(): boolean {
        return !!this.html && !!this.name && !!this.amount && this.amount > 0;
    }

    public html: string;

    public name: string;

    public amount: number;

    constructor(event: any) {
        super(StreamEventType.Subscription);

        this.name = event.name;
        this.amount = event.amount
        this.html = this.getHtml();
    }

    protected static SInit = (() => {
        SubscriptionEvent.prototype.name = null;
        SubscriptionEvent.prototype.amount = 0;
        SubscriptionEvent.prototype.html = null;
    })();

    private getHtml(): string {
        const iconCss = StreamEvent.lookupIconCss(this.eventType);
        const subAmount = this.getSubAmountString();

        if (!!iconCss && !!this.name && !!subAmount) {
            const iconHtml = `<i class="bar-icon ${iconCss}"></i>`;
            const spanHtml = `<span class="bar-text">${this.name} ${this.getSubAmountString()}</span>`;
            const html = ` ${iconHtml}${spanHtml}`;

            return html;
        }

        return null;
    }

    private getSubAmountString(): string {
        if (!!this.amount && this.amount > 0) {
            return `X${this.amount.toString()}`;
        } else {
            return '';
        }
    }
}

class CheerEvent extends StreamEvent {
    public get isValid(): boolean {
        return !!this.html && !!this.name && !!this.amount && this.amount > 0;
    }

    public html: string;

    public name: string;

    public amount: number;

    constructor(event: any) {
        super(StreamEventType.Cheer);

        if (event) {
            this.name = event.name;
            this.amount = event.amount;
        }

        this.name = event.name;
        this.amount = event.amount;
        this.html = this.getHtml();
    }

    protected static SInit = (() => {
        SubscriptionEvent.prototype.name = null;
        SubscriptionEvent.prototype.amount = 0;
        SubscriptionEvent.prototype.html = null;
    })();

    private getHtml(): string {
        const cheerAmount = this.getCheerAmountString();

        if (!!cheerAmount) {
            const iconHtml =
                `<svg class="bar-icon" viewBox="0 0 187.35 242.67">
                <path d="M221.2,159.15l-82.46-29.27a6.63,6.63,0,0,0-4.48,0L51.8,159.15a6.7,6.7,0,0,1-7.83-10l86.95-131a6.7,6.7,0,0,1,11.16,0l86.95,131A6.7,6.7,0,0,1,221.2,159.15Z" transform="translate(-42.83 -15.17)"/>
                <path d="M220.25,195.51l-80.09,61.24a6.7,6.7,0,0,1-7.32,0L52.75,195.51a6.69,6.69,0,0,1,1.42-11.92l80.09-28.44a6.75,6.75,0,0,1,4.48,0l80.09,28.44A6.69,6.69,0,0,1,220.25,195.51Z" transform="translate(-42.83 -15.17)"/>
             </svg>`;

            const spanHtml = `<span class="bar-text">${this.name} ${cheerAmount}</span>`;
            const html = `${iconHtml}${spanHtml}`;

            return html;
        }

        return null;
    }

    private getCheerAmountString(): string {
        if (typeof this.amount === 'number' && this.amount > 0) {
            return `X${this.amount.toString()}`;
        } else {
            return '';
        }
    }
}

interface WidgetOptions {
    events?: StreamEvent[];

    timeEventDisplay: number;

    timeEventAlertSlide: number;

    timeEventAlertFade: number;
}

class Widget {
    private timeEventDisplay: number;

    private timeEventAlertSlide: number;

    private timeEventAlertFade: number;

    private currentEventIndex: number;

    private events: StreamEvent[];

    private get currentEvent(): StreamEvent {
        if (!this.events || this.events.length === 0) {
            return null;
        }

        return this.events[this.currentEventIndex];
    }

    private get nextEvent(): StreamEvent {
        if (!this.events || this.events.length === 0) {
            return null;
        }

        this.incrementCurrentEventIndex();

        if (this.currentEventIndex >= this.events.length) {
            throw new Error('Widget::nextEvent() - Current event index value has become out of bounds');
        };

        return this.events[this.currentEventIndex];
    }

    private get barSlides(): HTMLCollection    
    {
        return document.querySelector('.bar').children;
    }

    private get currentBarSlide(): HTMLElement {
        const barSlides = this.barSlides;

        if (!!barSlides && barSlides.length > 0) {
            return barSlides[0] as HTMLElement;
        }

        return null;
    }

    constructor(options: WidgetOptions) {
        if (options) {
            this.timeEventDisplay = options.timeEventDisplay ? options.timeEventDisplay : this.timeEventDisplay;
            this.timeEventAlertSlide = options.timeEventAlertSlide ? options.timeEventAlertSlide : this.timeEventAlertSlide;
            this.timeEventAlertFade = options.timeEventAlertFade ? options.timeEventAlertFade : this.timeEventAlertFade;

            this.registerEvents(options.events);
        }
    }

    protected static SInit = (() => {
        Widget.prototype.timeEventDisplay = 10000;
        Widget.prototype.timeEventAlertSlide = 750;
        Widget.prototype.timeEventAlertFade = 2000;
        Widget.prototype.currentEventIndex = -1;
        Widget.prototype.events = [];
    })();

    public initializeEventDisplayCycle(): void {
        const currentBarSlide = this.currentBarSlide;
        const currentBarSlideContent = currentBarSlide.children[0] as HTMLElement;

        currentBarSlideContent.addEventListener('transitionend', (event: TransitionEvent) => {
            const property = event.propertyName;

            if (property === 'opacity') {
                if (currentBarSlideContent.style.opacity === '1') {
                    setTimeout(() => {
                        this.makeElementInvisible(currentBarSlideContent);
                    }, this.timeEventDisplay);
                } else {
                    currentBarSlideContent.innerHTML = this.nextEvent.html;
                    this.makeElementVisible(currentBarSlideContent);
                }
            }
        });

        if (!currentBarSlideContent.innerHTML.trim()) {
            currentBarSlideContent.innerHTML = this.currentEvent.html;

            setTimeout(() => {
                this.makeElementInvisible(currentBarSlideContent);
            }, this.timeEventDisplay);
        } else {
            this.makeElementInvisible(currentBarSlideContent);
        }
    }

    public registerEvent(event: StreamEvent): void {
        if (!event) {
            return;
        }

        const index = this.events.findIndex((x) => x.eventType === event.eventType);

        if (index === -1) {
            this.events.push(event);
        } else {
            this.events.splice(index, 1, event);
        }

        if (this.events.length === 1) {
            this.currentEventIndex = 0;
        }
    }

    public registerEvents(events: StreamEvent[]): void {
        if (events) {
            events.forEach((event) => this.registerEvent(event));
        }
    }

    private incrementCurrentEventIndex(): void {
        const nextEventIndexIsOutOfBounds = this.currentEventIndex + 1 >= this.events.length;

        if (nextEventIndexIsOutOfBounds) {
            this.currentEventIndex = 0;
        } else {
            this.currentEventIndex += 1;
        }
    }

    private makeElementVisible(element: HTMLElement): void {
        if (element) {
            element.style.opacity = '1';
        }
    }

    private makeElementInvisible(element: HTMLElement): void {
        if (element) {
            element.style.opacity = '0';
        }
    }
}

let timeEventDisplay: number;
let timeEventAlertSlide: number;
let timeEventAlertFade: number;

let widget: Widget;

window.addEventListener('onEventReceived', function (obj) {
    const listener: string = obj['detail']['listener'];
    const event = obj['detail']['event'];

    switch (listener) {
        case 'follower-latest':
            break;
        case 'subscriber-latest':
            break;
        case 'cheer-latest':
            break;
        default:
            break;
    }
});

window.addEventListener('onWidgetLoad', function (obj) {
    let data = obj['detail']['session']['data'];
    let fieldData = obj['detail']['fieldData'];

    if (isNaN(fieldData.eventCycleDisplayTime) || fieldData.eventCycleDisplayTime < 0) {
        throw new Error(`onWidgetLoad::Field data parameter 'eventCycleDisplayTime' has to be a positive number.`);
    }

    if (isNaN(fieldData.eventAlertSlideTime) || fieldData.eventAlertSlideTime < 0) {
        throw new Error(`onWidgetLoad::Field data parameter 'eventAlertSlideTime' has to be a positive number.`);    
    }

    if (isNaN(fieldData.eventAlertFadeTime) || fieldData.eventAlertFadeTime < 0) {
        throw new Error(`onWidgetLoad::Field data parameter 'eventAlertFadeTime' has to be a positive number.`);    
    }

    timeEventDisplay = fieldData.eventCycleDisplayTime * 1000;
    timeEventAlertSlide = fieldData.eventAlertSlideTime * 1000;
    timeEventAlertFade = fieldData.eventAlertFadeTime * 1000;

    let latestFollowEvent: FollowEvent = new FollowEvent(data['follower-latest']);
    let latestSubscriptionEvent: SubscriptionEvent = new SubscriptionEvent(data['subscriber-latest']);
    // let latestCheerEvent: CheerEvent = new CheerEvent(data['cheer-latest']);
    let latestCheerEvent: CheerEvent = new CheerEvent({ name: 'RandomName', amount: 1000 });

    let events: StreamEvent[] = [];

    if (latestFollowEvent.isValid) { events.push(latestFollowEvent); }
    if (latestSubscriptionEvent.isValid) { events.push(latestSubscriptionEvent); }
    if (latestCheerEvent.isValid) { events.push(latestCheerEvent); }

    widget = new Widget({
        events,
        timeEventDisplay,
        timeEventAlertSlide,
        timeEventAlertFade
    });

    widget.initializeEventDisplayCycle();
});
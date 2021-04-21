/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
import {
	AndroidFontName,
	ComponentAlignment,
	ContainerAspect,
	ContainerHandling,
	ContentService,
	FontFamily,
	HtmlContent,
	IOSFontName,
	MockedContentService,
	ContentSlotComponent as UpscaleContentSlotComponent,
} from '@caas/service-client-angular';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NEVER, Subject, of } from 'rxjs';

import { ActiveBreakpointService } from 'app/core/active-breakpoint/active-breakpoint.service';
import { HtmlSanitizerService } from 'app/core/html-sanitizer/html-sanitizer.service';
import { MockActiveBreakpointService } from 'app/core/active-breakpoint/active-breakpoint.service.mock';
import { MockHtmlSanitizerService } from 'app/core/html-sanitizer/html-sanitizer.service.mock';
import { MockStyleConfigurationService } from 'app/style-configuration/style-configuration.service.mock';
import { StyleConfigurationService } from 'app/style-configuration/style-configuration.service';
import { aliases } from 'app/custom-breakpoints/aliases.const';

import { ContentSlotComponent } from './content-slot.component';

describe(ContentSlotComponent.name, () => {
	let component: ContentSlotComponent;
	let fixture: ComponentFixture<ContentSlotComponent>;

	let contentSlotComponent: UpscaleContentSlotComponent;
	let activeBreakpointService: ActiveBreakpointService;
	let contentService: ContentService;
	let styleConfigurationService: StyleConfigurationService;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [ContentSlotComponent],
				providers: [
					{ provide: ActiveBreakpointService, useClass: MockActiveBreakpointService },
					{ provide: ContentService, useClass: MockedContentService },
					{ provide: HtmlSanitizerService, useClass: MockHtmlSanitizerService },
					{ provide: StyleConfigurationService, useClass: MockStyleConfigurationService },
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
			}).compileComponents();

			contentSlotComponent = new UpscaleContentSlotComponent();

			activeBreakpointService = TestBed.inject(ActiveBreakpointService);
			contentService = TestBed.inject(ContentService);
			styleConfigurationService = TestBed.inject(StyleConfigurationService);
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(ContentSlotComponent);
		component = fixture.componentInstance;

		component.component = contentSlotComponent;
	});

	function suspendContentRequest(): void {
		spyOn(contentService, 'getAll').and.returnValue(NEVER);
		spyOn(styleConfigurationService, 'createGlobalStyleSheet').and.stub();
	}

	it('should create', () => {
		suspendContentRequest();

		fixture.detectChanges();

		expect(component).toBeTruthy();
	});

	it('should have safe defaults', () => {
		suspendContentRequest();

		fixture.detectChanges();

		expect(component.aspectRatio).toBe(ContainerAspect.NATURAL_HEIGHT);
		expect(component.containerWidth).toBeUndefined();
		expect(component.height).toBeUndefined();
		expect(component.maxWidth).toBeUndefined();
		expect(component.headline).toBeUndefined();
		expect(component.subHeadline).toBeUndefined();
		expect(component.headlineAlignment).toBeUndefined();
		expect(component.subHeadlineAlignment).toBeUndefined();
		expect(component.margin).toBe('0px 0px 0px 0px');
		expect(component.backgroundStyle).toBeUndefined();
		expect(component.headlineStyle).toBeUndefined();
		expect(component.subHeadlineStyle).toBeUndefined();
	});

	it('should override background color', () => {
		suspendContentRequest();
		const mockStylingAttributes = {
			overrideComponetStyle: true,
			background: {
				color: '#F5F5F5',
				alpha: 'FF',
			},
			headline: {
				fontFamilyKey: FontFamily.ROBOTO_BOLD,
				androidFontName: AndroidFontName.ROBOTO_BOLD,
				iOSFontName: IOSFontName.ROBOTO_BOLD,
				alpha: 'FF',
				color: '#000000',
			},
			subHeadline: {
				fontFamilyKey: FontFamily.ROBOTO_LIGHT,
				androidFontName: AndroidFontName.ROBOTO_REGULAR,
				iOSFontName: IOSFontName.ROBOTO_REGULAR,
				alpha: 'FF',
				color: '#000000',
			},
		};
		contentSlotComponent.stylingAttributes = mockStylingAttributes;
		fixture.detectChanges();

		expect(component.backgroundStyle).toEqual({ 'background-color': '#F5F5F5FF' });
	});

	it('should set headline and subheadline', () => {
		suspendContentRequest();

		contentSlotComponent.showComponentHeadline = contentSlotComponent.showComponentSubHeadline = true;
		contentSlotComponent.headline = 'foo';
		contentSlotComponent.subHeadline = 'barbaz';
		contentSlotComponent.headlineAlignment = ComponentAlignment.CENTER;
		contentSlotComponent.subHeadlineAlignment = ComponentAlignment.RIGHT;

		fixture.detectChanges();

		expect(component.headline).toBe('foo');
		expect(component.subHeadline).toBe('barbaz');
		expect(component.headlineAlignment).toBe('center');
		expect(component.subHeadlineAlignment).toBe('right');
	});

	it('should set margins', () => {
		suspendContentRequest();

		contentSlotComponent.topMarginValue = 16;
		contentSlotComponent.bottomMarginValue = 24;
		contentSlotComponent.leftMarginValue = 32;

		fixture.detectChanges();

		expect(component.margin).toBe('16px 0px 24px 32px');
	});

	it('should set container width', () => {
		suspendContentRequest();

		contentSlotComponent.widthConfiguration = ContainerHandling.CONTAINER_WIDTH;

		fixture.detectChanges();

		expect(component.containerWidth).toBe(true);
	});

	it('should set max width', () => {
		suspendContentRequest();

		contentSlotComponent.widthConfiguration = ContainerHandling.FULL_WIDTH;
		contentSlotComponent.controlMaxWidth = true;
		contentSlotComponent.maxWidth = 1300;

		fixture.detectChanges();

		expect(component.maxWidth).toBe('1300px');
	});

	it('should set aspect ratio', () => {
		suspendContentRequest();

		contentSlotComponent.aspectRatio = ContainerAspect.RATIO_16_9;

		fixture.detectChanges();

		expect(component.aspectRatio).toBe(ContainerAspect.RATIO_16_9);
	});

	it('should set max height', () => {
		suspendContentRequest();

		const activeBreakpoints = new Subject<void>();
		activeBreakpointService.activeBreakpoints = <any>activeBreakpoints;

		let currentAlias: string;

		spyOn(activeBreakpointService, 'isAnyActive').and.callFake(manyAliases => manyAliases.includes(currentAlias));

		contentSlotComponent.aspectRatio = ContainerAspect.FIXED_HEIGHT;
		contentSlotComponent.mobileFixedHeight = 251;
		contentSlotComponent.tabletFixedHeight = 502;
		contentSlotComponent.desktopFixedHeight = 731;

		fixture.detectChanges();

		expect(component.aspectRatio).toBe(ContainerAspect.FIXED_HEIGHT);

		currentAlias = aliases.mobile;

		activeBreakpoints.next();

		expect(component.height).toBe(251);

		currentAlias = aliases.tablet;

		activeBreakpoints.next();

		expect(component.height).toBe(502);

		currentAlias = aliases.desktop;

		activeBreakpoints.next();

		expect(component.height).toBe(731);
	});

	it('should get content', () => {
		const content = new HtmlContent({ id: 'content001', name: 'Content', status: 'PUBLISHED', publicationInfo: null });
		content.text = '<p style="text-align:center;margin:0"><img alt="foo"/></p>';

		spyOn(contentService, 'getAll').and.returnValue(of([content]));
		(<any>contentSlotComponent.contentIds) = ['content001'];

		fixture.detectChanges();

		expect(component.text).toBeDefined();
	});
});

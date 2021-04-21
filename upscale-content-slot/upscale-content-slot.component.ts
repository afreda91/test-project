/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
import {
	ArticleContent,
	ComponentAlignment,
	ComponentStylingAttributes,
	ContainerAspect,
	ContainerHandling,
	ContentService,
	ContentType,
	HtmlContent,
	ContentSlotComponent as UpscaleContentSlotComponent,
} from '@caas/service-client-angular';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { ActiveBreakpointService } from 'app/core/active-breakpoint/active-breakpoint.service';
import { StyleConfigurationService } from 'app/style-configuration/style-configuration.service';
import { aliases } from 'app/custom-breakpoints/aliases.const';

import { ComponentComponent } from '../component.components';

@Component({
	selector: 'upscale-content-slot',
	templateUrl: './content-slot.component.html',
	styleUrls: ['./content-slot.component.scss'],
})
export class ContentSlotComponent extends ComponentComponent<UpscaleContentSlotComponent> implements OnDestroy, OnInit {
	@HostBinding('style.margin')
	margin: string;

	aspectRatio: ContainerAspect;

	backgroundStyle: { [key: string]: string };
	headlineStyle: { [key: string]: string };
	subHeadlineStyle: { [key: string]: string };
	/** false if maxWidth is specified. */
	containerWidth: boolean;
	height: number;
	/** undefined if containerWidth is true. */
	maxWidth: string;

	headline: string;
	subHeadline: string;
	headlineAlignment: string;
	subHeadlineAlignment: string;

	text: SafeHtml;

	private subscriptions = new Subscription();

	constructor(
		private activeBreakpointService: ActiveBreakpointService,
		private contentService: ContentService,
		private domSanitizer: DomSanitizer,
		private styleConfigurationService: StyleConfigurationService
	) {
		super();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	ngOnInit(): void {
		const { activeBreakpointService, component, contentService, subscriptions } = this;
		const {
			aspectRatio,
			bottomMarginValue = 0,
			controlMaxWidth,
			maxWidth,
			desktopFixedHeight,
			headline,
			headlineAlignment,
			leftMarginValue = 0,
			mobileFixedHeight,
			rightMarginValue = 0,
			showComponentHeadline,
			showComponentSubHeadline,
			subHeadline,
			subHeadlineAlignment,
			tabletFixedHeight,
			topMarginValue = 0,
			widthConfiguration,
			stylingAttributes,
		} = component;

		this.setOverrideStyle(stylingAttributes);

		// Headline/SubHeadline
		if (showComponentHeadline) {
			this.headline = headline;
		}
		if (showComponentSubHeadline) {
			this.subHeadline = subHeadline;
		}

		switch (headlineAlignment) {
			case ComponentAlignment.CENTER:
				this.headlineAlignment = 'center';
				break;
			case ComponentAlignment.RIGHT:
				this.headlineAlignment = 'right';
				break;
		}

		switch (subHeadlineAlignment) {
			case ComponentAlignment.CENTER:
				this.subHeadlineAlignment = 'center';
				break;
			case ComponentAlignment.RIGHT:
				this.subHeadlineAlignment = 'right';
				break;
		}

		// Margins
		this.margin = `${topMarginValue}px ${rightMarginValue}px ${bottomMarginValue}px ${leftMarginValue}px`;

		// Width
		switch (widthConfiguration) {
			case ContainerHandling.CONTAINER_WIDTH:
				this.containerWidth = true;
				break;
			case ContainerHandling.FULL_WIDTH:
				if (controlMaxWidth) {
					this.maxWidth = `${maxWidth}px`;
				}
				break;
		}

		// Aspect ratio
		this.aspectRatio = aspectRatio;

		if (aspectRatio === ContainerAspect.FIXED_HEIGHT) {
			const isAnyActive = activeBreakpointService.isAnyActive.bind(activeBreakpointService);

			const subscription = activeBreakpointService.activeBreakpoints.subscribe(() => {
				if (isAnyActive([aliases.mobile])) {
					this.height = mobileFixedHeight;
				} else if (isAnyActive([aliases.tablet])) {
					this.height = tabletFixedHeight;
				} else if (isAnyActive([aliases.desktop])) {
					this.height = desktopFixedHeight;
				}
			});

			subscriptions.add(subscription);
		}

		const { contentIds } = component;

		if (contentIds.length) {
			contentService
				.getAll({
					ids: contentIds,
					status: ['PUBLISHED'],
					types: [ContentType.ARTICLE, ContentType.HTML_CONTENT],
				})
				.subscribe((contents: Array<ArticleContent | HtmlContent>) => {
					const { length } = contentIds;
					let content: ArticleContent | HtmlContent;

					// Preserve ordinality
					for (let i = 0; i < length; i++) {
						content = contents.find(c => c.id === contentIds[i]);
						if (content) {
							break;
						}
					}

					if (content?.text) {
						const text = (<HtmlContent>content).text;
						this.text = this.domSanitizer.bypassSecurityTrustHtml(text);
					}
				});
		}
	}

	private setOverrideStyle(stylingAttributes: ComponentStylingAttributes): void {
		if (stylingAttributes) {
			this.backgroundStyle = this.styleConfigurationService.convertStyleStringToObject(
				this.styleConfigurationService.adapt(stylingAttributes?.backgroundColor, { color: 'background-color' })
			);
			this.headlineStyle = this.styleConfigurationService.convertStyleStringToObject(
				this.styleConfigurationService.adapt(stylingAttributes?.headline)
			);
			this.subHeadlineStyle = this.styleConfigurationService.convertStyleStringToObject(
				this.styleConfigurationService.adapt(stylingAttributes?.subHeadline)
			);
		}
	}
}

/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import React, { useCallback, useRef, useState } from 'react';
import { Image, X, Upload } from 'lucide-react';

export interface ImageData {
	id: string;
	file: File;
	dataUrl: string;
	name: string;
	size: number;
	type: string;
}

interface ImageUploadButtonProps {
	onImageSelect: (images: ImageData[]) => void;
	className?: string;
	disabled?: boolean;
}

export const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
	onImageSelect,
	className = '',
	disabled = false
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = useCallback((files: FileList | null) => {
		if (!files) return;

		const imageFiles = Array.from(files).filter(file =>
			file.type.startsWith('image/')
		);

		if (imageFiles.length === 0) return;

		const processImages = async () => {
			const imageDataArray: ImageData[] = [];

			for (const file of imageFiles) {
				try {
					const dataUrl = await new Promise<string>((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = () => resolve(reader.result as string);
						reader.onerror = reject;
						reader.readAsDataURL(file);
					});

					imageDataArray.push({
						id: `${Date.now()}-${Math.random()}`,
						file,
						dataUrl,
						name: file.name,
						size: file.size,
						type: file.type
					});
				} catch (error) {
					console.error('Error processing image:', error);
				}
			}

			if (imageDataArray.length > 0) {
				onImageSelect(imageDataArray);
			}
		};

		processImages();
	}, [onImageSelect]);

	const handleClick = useCallback(() => {
		if (!disabled) {
			fileInputRef.current?.click();
		}
	}, [disabled]);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		handleFileSelect(e.dataTransfer.files);
	}, [handleFileSelect]);

	return (
		<div
			className={`relative ${className}`}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			<button
				type="button"
				onClick={handleClick}
				disabled={disabled}
				className={`
					flex items-center justify-center w-8 h-8 rounded-md
					text-void-fg-3 hover:text-void-fg-1 hover:bg-void-bg-2
					transition-colors duration-200
					${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
				`}
				title="Upload image"
			>
				<Image size={16} />
			</button>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				multiple
				onChange={(e) => handleFileSelect(e.target.files)}
				className="hidden"
			/>
		</div>
	);
};

interface ImagePillProps {
	image: ImageData;
	onRemove: (id: string) => void;
	onHover?: (image: ImageData) => void;
	onLeave?: () => void;
}

export const ImagePill: React.FC<ImagePillProps> = ({
	image,
	onRemove,
	onHover,
	onLeave
}) => {
	const [showPreview, setShowPreview] = useState(false);

	const handleMouseEnter = useCallback(() => {
		setShowPreview(true);
		onHover?.(image);
	}, [image, onHover]);

	const handleMouseLeave = useCallback(() => {
		setShowPreview(false);
		onLeave?.();
	}, [onLeave]);

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<div className="relative group">
			<div
				className="
					flex items-center gap-2 px-2 py-1 rounded-md
					bg-void-bg-2 border border-void-border-3
					hover:border-void-border-1 transition-colors duration-200
					cursor-pointer
				"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<div className="w-4 h-4 rounded overflow-hidden bg-void-bg-3">
					<img
						src={image.dataUrl}
						alt={image.name}
						className="w-full h-full object-cover"
					/>
				</div>
				<span className="text-xs text-void-fg-2 truncate max-w-20">
					{image.name}
				</span>
				<span className="text-xs text-void-fg-3">
					{formatFileSize(image.size)}
				</span>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onRemove(image.id);
					}}
					className="
						opacity-0 group-hover:opacity-100
						text-void-fg-3 hover:text-void-fg-1
						transition-opacity duration-200
					"
				>
					<X size={12} />
				</button>
			</div>

			{/* Thumbnail Preview */}
			{showPreview && (
				<div className="absolute bottom-full left-0 mb-2 z-50">
					<div className="
						bg-void-bg-1 border border-void-border-2 rounded-lg shadow-lg
						p-2 max-w-48 max-h-48
					">
						<img
							src={image.dataUrl}
							alt={image.name}
							className="w-full h-full object-contain rounded"
						/>
						<div className="mt-1 text-xs text-void-fg-3 text-center">
							{image.name}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

interface ImageUploadAreaProps {
	images: ImageData[];
	onImagesChange: (images: ImageData[]) => void;
	onImageSelect: (images: ImageData[]) => void;
	className?: string;
	disabled?: boolean;
}

export const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
	images,
	onImagesChange,
	onImageSelect,
	className = '',
	disabled = false
}) => {
	const [isDragOver, setIsDragOver] = useState(false);

	const handleRemoveImage = useCallback((id: string) => {
		onImagesChange(images.filter(img => img.id !== id));
	}, [images, onImagesChange]);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);

		const files = e.dataTransfer.files;
		if (files) {
			const imageFiles = Array.from(files).filter(file =>
				file.type.startsWith('image/')
			);

			if (imageFiles.length > 0) {
				const processImages = async () => {
					const newImages: ImageData[] = [];

					for (const file of imageFiles) {
						try {
							const dataUrl = await new Promise<string>((resolve, reject) => {
								const reader = new FileReader();
								reader.onload = () => resolve(reader.result as string);
								reader.onerror = reject;
								reader.readAsDataURL(file);
							});

							newImages.push({
								id: `${Date.now()}-${Math.random()}`,
								file,
								dataUrl,
								name: file.name,
								size: file.size,
								type: file.type
							});
						} catch (error) {
							console.error('Error processing image:', error);
						}
					}

					if (newImages.length > 0) {
						onImageSelect(newImages);
					}
				};

				processImages();
			}
		}
	}, [onImageSelect]);

	return (
		<div
			className={`
				relative min-h-[60px] p-2 rounded-md border-2 border-dashed
				transition-colors duration-200
				${isDragOver
					? 'border-void-border-1 bg-void-bg-2'
					: 'border-void-border-3 bg-void-bg-1'
				}
				${className}
			`}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			{images.length === 0 ? (
				<div className="flex items-center justify-center h-full text-void-fg-3">
					<div className="flex items-center gap-2">
						<Upload size={16} />
						<span className="text-sm">Drag images here or click to upload</span>
					</div>
				</div>
			) : (
				<div className="flex flex-wrap gap-2">
					{images.map((image) => (
						<ImagePill
							key={image.id}
							image={image}
							onRemove={handleRemoveImage}
						/>
					))}
				</div>
			)}
		</div>
	);
};

package com.touristconnect.service;

import com.touristconnect.dto.PostDto;
import com.touristconnect.entity.Post;
import com.touristconnect.entity.User;
import com.touristconnect.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final com.touristconnect.repository.PostLikeRepository postLikeRepository;
    private final com.touristconnect.repository.PostCommentRepository postCommentRepository;
    private final com.touristconnect.repository.UserProfileRepository userProfileRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public PostDto createPost(User user, String content, MultipartFile file, String feeling, String location)
            throws IOException {
        Post post = new Post();
        post.setUser(user);
        post.setContent(content);
        post.setFeeling(feeling);
        post.setLocation(location);

        if (file != null && !file.isEmpty()) {
            String url = fileStorageService.saveFile(file);
            post.setMediaUrl(url);
            String contentType = file.getContentType();
            if (contentType != null && contentType.startsWith("image")) {
                post.setMediaType("IMAGE");
            } else if (contentType != null && contentType.startsWith("video")) {
                post.setMediaType("VIDEO");
            } else {
                post.setMediaType("TEXT");
            }
        } else {
            post.setMediaType("TEXT");
        }

        Post savedPost = postRepository.save(post);
        return mapToDto(savedPost);
    }

    @Transactional(readOnly = true)
    public List<PostDto> getFeed(User currentUser) {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(post -> mapToDto(post, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostDto> getUserPosts(User user, User currentUser) {
        return postRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(post -> mapToDto(post, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostDto> getUserMediaPosts(User user, String type, User currentUser) {
        return postRepository.findByUserAndMediaTypeOrderByCreatedAtDesc(user, type).stream()
                .map(post -> mapToDto(post, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional
    public PostDto toggleLike(Long postId, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        java.util.Optional<com.touristconnect.entity.PostLike> existingLike = postLikeRepository.findByPostAndUser(post, user);
        
        if (existingLike.isPresent()) {
            postLikeRepository.delete(existingLike.get());
        } else {
            postLikeRepository.save(new com.touristconnect.entity.PostLike(post, user));
        }
        
        return mapToDto(post, user);
    }

    @Transactional
    public com.touristconnect.dto.CommentDto addComment(Long postId, User user, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        com.touristconnect.entity.PostComment comment = new com.touristconnect.entity.PostComment(post, user, content);
        com.touristconnect.entity.PostComment savedComment = postCommentRepository.save(comment);
        
        return mapToCommentDto(savedComment);
    }

    @Transactional
    public void deletePost(Long postId, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (!post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this post");
        }
        
        postRepository.delete(post);
    }

    private PostDto mapToDto(Post post) {
        return mapToDto(post, null);
    }

    private PostDto mapToDto(Post post, User currentUser) {
        List<com.touristconnect.dto.CommentDto> commentDtos = post.getComments().stream()
                .map(this::mapToCommentDto)
                .collect(Collectors.toList());

        boolean isLiked = false;
        if (currentUser != null) {
            isLiked = postLikeRepository.existsByPostAndUser(post, currentUser);
        }

        String profilePictureUrl = userProfileRepository.findByUser(post.getUser())
                .map(com.touristconnect.entity.UserProfile::getProfilePictureUrl)
                .orElse(null);

        return PostDto.builder()
                .id(post.getId())
                .content(post.getContent())
                .location(post.getLocation())
                .feeling(post.getFeeling())
                .mediaUrl(post.getMediaUrl())
                .mediaType(post.getMediaType())
                .createdAt(post.getCreatedAt())
                .userId(post.getUser().getId())
                .username(post.getUser().getUsername())
                .fullName(post.getUser().getFullName())
                .profilePictureUrl(profilePictureUrl)
                .likeCount((int) postLikeRepository.countByPost(post))
                .commentCount((int) postCommentRepository.countByPost(post))
                .isLikedByCurrentUser(isLiked)
                .comments(commentDtos)
                .build();
    }

    private com.touristconnect.dto.CommentDto mapToCommentDto(com.touristconnect.entity.PostComment comment) {
        String profilePictureUrl = userProfileRepository.findByUser(comment.getUser())
                .map(com.touristconnect.entity.UserProfile::getProfilePictureUrl)
                .orElse(null);

        return com.touristconnect.dto.CommentDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .userId(comment.getUser().getId())
                .username(comment.getUser().getUsername())
                .fullName(comment.getUser().getFullName())
                .profilePictureUrl(profilePictureUrl)
                .build();
    }
}

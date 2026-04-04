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
    public List<PostDto> getFeed() {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostDto> getUserPosts(User user) {
        return postRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostDto> getUserMediaPosts(User user, String type) {
        return postRepository.findByUserAndMediaTypeOrderByCreatedAtDesc(user, type).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private PostDto mapToDto(Post post) {
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
                .build();
    }
}
